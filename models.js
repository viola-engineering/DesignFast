/**
 * Maps frontend model aliases ("claude", "gemini") to provider config.
 * The frontend sends models: ["claude"] — routes must resolve via this map.
 */
export const MODEL_MAP = {
  claude: { providerName: 'anthropic', model: 'claude-sonnet-4-6', apiKeyEnv: 'ANTHROPIC_API_KEY' },
  gemini: { providerName: 'gemini', model: 'gemini-3-flash-preview', apiKeyEnv: 'GOOGLE_API_KEY' },
};

/**
 * Bridges provider names used by createProvider / jobs table ('anthropic' | 'gemini')
 * to the provider labels used in the api_keys table ('anthropic' | 'google').
 *
 * Needed in resolveApiKey() when looking up BYOK keys:
 *   jobs.provider = 'gemini' → api_keys.provider = 'google'
 */
export const PROVIDER_TO_APIKEY_PROVIDER = {
  anthropic: 'anthropic',
  gemini: 'google',
};
