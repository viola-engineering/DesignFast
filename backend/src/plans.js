import { query } from './db.js';
import { decrypt } from './encryption.js';
import { PROVIDER_TO_APIKEY_PROVIDER } from './models.js';

export const PLANS = {
  free: {
    generationsPerMonth: 3,
    maxStyles: 2,
    maxVersions: 1,
    creditsPerMonth: 0,
    allowedModels: ['gemini'],
    byokEnabled: false,
    byokGenerationCap: 0,
  },
  pro: {
    generationsPerMonth: 3, // fallback allowance when credits exhausted
    maxStyles: 4,
    maxVersions: 1,
    creditsPerMonth: 100,
    allowedModels: ['gemini', 'claude'],
    byokEnabled: true,
    byokGenerationCap: 200,
  },
};

/**
 * Credit cost per job, keyed by provider name.
 */
export const CREDIT_COSTS = {
  anthropic: 20,
  gemini: 1,
};

/**
 * Calculate the total credit cost for a generation request.
 *
 * @param {string[]} models - Model keys (e.g. ['claude'])
 * @param {number} stylesCount - Number of styles
 * @param {number} versions - Number of versions
 * @param {object} modelMap - MODEL_MAP from models.js
 * @returns {number} Total credit cost
 */
export function calculateCreditCost(models, stylesCount, versions, modelMap) {
  let total = 0;
  for (const modelKey of models) {
    const cfg = modelMap[modelKey];
    if (cfg) {
      const perJob = CREDIT_COSTS[cfg.providerName] || 0;
      total += perJob * stylesCount * versions;
    }
  }
  return total;
}

/**
 * Check whether a user can create a generation with the given request params.
 * Returns { allowed, error?, billingMode?, creditCost? }.
 *
 * billingMode:
 *   'generation' — free user or pro user in fallback free mode (increment generations_used)
 *   'credits'    — pro user paying with credits (deduct credits_used)
 *   'byok'       — pro user with own keys (increment byok_generations_used)
 *
 * @param {object} user - User row from DB
 * @param {object} request - { models: string[], versions: number, styles: string[]|object[], isByok: boolean }
 * @param {object} modelMap - MODEL_MAP from models.js
 */
export function checkUsageLimits(user, request, modelMap) {
  const plan = PLANS[user.plan] || PLANS.free;
  const stylesCount = request.styles ? request.styles.length : 1;

  // Validate versions
  if (request.versions > plan.maxVersions) {
    return { allowed: false, error: `Your plan allows up to ${plan.maxVersions} version(s) per generation` };
  }

  // Validate styles count
  if (stylesCount > plan.maxStyles) {
    return { allowed: false, error: `Your plan allows up to ${plan.maxStyles} style(s) per generation` };
  }

  // Validate model access
  for (const modelKey of request.models) {
    if (!plan.allowedModels.includes(modelKey)) {
      return { allowed: false, error: `Upgrade to Pro to use ${modelKey === 'claude' ? 'Claude' : modelKey}` };
    }
  }

  // BYOK path (pro only)
  if (request.isByok) {
    if (!plan.byokEnabled) {
      return { allowed: false, error: 'BYOK is available on the Pro plan' };
    }
    if (user.byok_generations_used >= plan.byokGenerationCap) {
      return { allowed: false, error: 'Monthly BYOK generation limit reached' };
    }
    return { allowed: true, billingMode: 'byok', creditCost: 0 };
  }

  // Pro user with credits
  if (user.plan === 'pro') {
    const creditCost = calculateCreditCost(request.models, stylesCount, request.versions, modelMap);
    if (user.credits_used + creditCost <= user.credits_limit) {
      return { allowed: true, billingMode: 'credits', creditCost };
    }

    // Pro user out of credits — fallback to free-tier allowance (Gemini only)
    for (const modelKey of request.models) {
      if (modelKey !== 'gemini') {
        return { allowed: false, error: 'Credits exhausted. You can still use Gemini until your credits renew.' };
      }
    }
    if (user.generations_used >= plan.generationsPerMonth) {
      return { allowed: false, error: 'Credits and fallback generations exhausted. Renew your credits or wait for the next billing period.' };
    }
    return { allowed: true, billingMode: 'generation', creditCost: 0 };
  }

  // Free user
  if (user.generations_used >= plan.generationsPerMonth) {
    return { allowed: false, error: 'Monthly generation limit reached. Upgrade to Pro for 100 credits.' };
  }

  return { allowed: true, billingMode: 'generation', creditCost: 0 };
}

/**
 * Check whether a user has BYOK keys stored for the given model aliases.
 * Returns true if all required provider keys exist.
 *
 * @param {string} userId
 * @param {string[]} providerNames - Provider names from MODEL_MAP (e.g. ['anthropic', 'gemini'])
 */
export async function hasApiKeys(userId, providerNames) {
  // Map provider names to api_keys table provider labels
  const apiKeyProviders = [...new Set(
    providerNames.map(p => PROVIDER_TO_APIKEY_PROVIDER[p]).filter(Boolean)
  )];

  if (apiKeyProviders.length === 0) return false;

  const { rows } = await query(
    `SELECT provider FROM designfast.api_keys WHERE user_id = $1 AND provider = ANY($2)`,
    [userId, apiKeyProviders]
  );

  const found = new Set(rows.map(r => r.provider));
  return apiKeyProviders.every(p => found.has(p));
}
