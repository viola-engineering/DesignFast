/**
 * Public config endpoint — exposes feature flags to frontend.
 * No authentication required.
 */
export default async function (app) {
  // GET /api/config
  app.get('/api/config', async () => {
    return {
      byokEnabled: process.env.BYOK_ENABLED === 'true',
      githubUrl: 'https://github.com/viola-engineering/designfast',
    };
  });
}
