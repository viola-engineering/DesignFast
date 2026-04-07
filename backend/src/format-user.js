import { PLANS } from './plans.js';

/**
 * Format a user DB row for API responses.
 * Strips sensitive fields and adds computed plan data.
 */
export function formatUser(row) {
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
  };
}
