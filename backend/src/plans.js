import { query } from './db.js';
import { decrypt } from './encryption.js';
import { PROVIDER_TO_APIKEY_PROVIDER } from './models.js';

export const PLANS = {
  free:    { generationsPerMonth: 5,   maxVersions: 1, maxStyles: 1  },
  starter: { generationsPerMonth: 50,  maxVersions: 3, maxStyles: 5  },
  pro:     { generationsPerMonth: 200, maxVersions: 5, maxStyles: 30 },
};

/**
 * Check whether a user can create a generation with the given request params.
 * Returns { allowed: true } or { allowed: false, error: string }.
 *
 * @param {object} user - User row from DB (must have plan, generations_used)
 * @param {object} request - { versions: number, styles: string[] }
 */
export function checkGenerationLimits(user, request) {
  const plan = PLANS[user.plan] || PLANS.free;

  if (user.generations_used >= plan.generationsPerMonth) {
    return { allowed: false, error: 'Monthly generation limit reached' };
  }

  if (request.versions > plan.maxVersions) {
    return { allowed: false, error: `Your plan allows up to ${plan.maxVersions} version(s) per generation` };
  }

  if (request.styles && request.styles.length > plan.maxStyles) {
    return { allowed: false, error: `Your plan allows up to ${plan.maxStyles} style(s) per generation` };
  }

  return { allowed: true };
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
