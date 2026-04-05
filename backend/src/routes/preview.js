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

    const revisionParam = req.query.revision;
    let rows;

    if (revisionParam !== undefined) {
      const revision = parseInt(revisionParam, 10);
      if (isNaN(revision) || revision < 0) {
        return reply.code(400).send({ error: 'Invalid revision' });
      }
      ({ rows } = await query(
        `SELECT content FROM designfast.job_files WHERE job_id = $1 AND filename = $2 AND revision = $3`,
        [jobId, filename, revision]
      ));
    } else {
      ({ rows } = await query(
        `SELECT content FROM designfast.job_files WHERE job_id = $1 AND filename = $2 ORDER BY revision DESC LIMIT 1`,
        [jobId, filename]
      ));
    }

    if (rows.length === 0) {
      return reply.code(404).send();
    }

    const ext = filename.slice(filename.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'text/plain';

    reply
      .header('Content-Type', contentType + '; charset=utf-8')
      .header('Cache-Control', 'no-cache')
      .send(rows[0].content);
  });
}
