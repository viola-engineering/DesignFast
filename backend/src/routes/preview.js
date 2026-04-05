import { query } from '../db.js';
import { requireUUID } from '../validation.js';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

export default async function (app) {
  // GET /preview/:jobId/:filename — No auth (UUID is the access token)
  app.get('/preview/:jobId/:filename', async (req, reply) => {
    const { jobId, filename } = req.params;
    if (requireUUID(jobId, reply)) return;

    const { rows } = await query(
      `SELECT content FROM designfast.job_files WHERE job_id = $1 AND filename = $2`,
      [jobId, filename]
    );

    if (rows.length === 0) {
      return reply.code(404).send();
    }

    const ext = filename.slice(filename.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'text/plain';

    reply
      .header('Content-Type', contentType + '; charset=utf-8')
      .header('Cache-Control', 'public, max-age=3600')
      .send(rows[0].content);
  });
}
