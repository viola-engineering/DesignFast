import { PLANS } from './plans.js';
import { query } from './db.js';

/**
 * Format a user DB row for API responses.
 * Strips sensitive fields and adds computed plan data.
 * @param {object} row - User database row
 * @param {string[]} [oauthProviders] - Optional array of linked OAuth provider names
 */
export function formatUser(row, oauthProviders = []) {
  const plan = PLANS[row.plan] || PLANS.free;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    avatarUrl: row.avatar_url || null,
    emailVerified: !!row.email_verified_at,
    generationsUsed: row.generations_used,
    generationsLimit: plan.generationsPerMonth,
    creditsUsed: row.credits_used,
    creditsLimit: row.credits_limit,
    byokGenerationsUsed: row.byok_generations_used,
    byokGenerationCap: plan.byokGenerationCap,
    billingPeriodStart: row.billing_period_start || null,
    createdAt: row.created_at,
    oauthProviders,
    hasPassword: !!row.password_hash,
  };
}

/**
 * Format a user with their OAuth providers fetched from the database.
 * @param {object} row - User database row
 */
export async function formatUserWithOAuth(row) {
  const { rows: identities } = await query(
    `SELECT provider FROM designfast.oauth_identities WHERE user_id = $1`,
    [row.id]
  );
  const oauthProviders = identities.map((i) => i.provider);
  return formatUser(row, oauthProviders);
}
