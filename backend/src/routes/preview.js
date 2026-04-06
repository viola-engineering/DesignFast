import { query } from '../db.js';
import { requireUUID } from '../validation.js';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

/**
 * Shared handler for serving a job file at a specific (or latest) revision.
 */
async function serveFile(req, reply, jobId, filename, revisionParam) {
  if (requireUUID(jobId, reply)) return;

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
}

export default async function (app) {
  // GET /preview/:jobId/r/:revision/:filename — revision in path
  // All relative URLs in HTML (style.css, script.js) resolve under the
  // same /preview/:jobId/r/:revision/ prefix, so every asset gets the
  // correct revision automatically.
  app.get('/preview/:jobId/r/:revision/:filename', async (req, reply) => {
    const { jobId, revision, filename } = req.params;
    return serveFile(req, reply, jobId, filename, revision);
  });

  // GET /preview/:jobId/:filename — no revision (serves latest)
  // Kept for backwards compat & initial generation preview before any refine.
  app.get('/preview/:jobId/:filename', async (req, reply) => {
    const { jobId, filename } = req.params;
    return serveFile(req, reply, jobId, filename, req.query.revision);
  });
}
