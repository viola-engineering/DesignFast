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

  let content = rows[0].content;

  // Auto-print: inject script if ?print=1 is set and file is HTML
  if (req.query.print === '1' && ext === '.html') {
    // Wait for everything (CSS, fonts, images) then print
    const printScript = `<script>
(function(){
  function waitAndPrint(){
    var checks=0,maxChecks=50;
    function check(){
      checks++;
      var ready=document.readyState==='complete';
      var fontsReady=!document.fonts||document.fonts.status==='loaded';
      var imgs=document.images,imgsLoaded=true;
      for(var i=0;i<imgs.length;i++){if(!imgs[i].complete)imgsLoaded=false;}
      if((ready&&fontsReady&&imgsLoaded)||checks>=maxChecks){
        setTimeout(window.print,800);
      }else{
        setTimeout(check,100);
      }
    }
    check();
  }
  if(document.readyState==='complete'){setTimeout(waitAndPrint,500);}
  else{window.addEventListener('load',function(){setTimeout(waitAndPrint,500);});}
})()
</script>`;
    content = content.replace('</body>', printScript + '</body>');
  }

  reply
    .header('Content-Type', contentType + '; charset=utf-8')
    .header('Cache-Control', 'no-cache')
    .send(content);
}

/**
 * Serve an uploaded asset image linked to a job.
 * Resolves: job → generation → job_uploads → uploads.data
 *
 * SECURITY: SVG files can contain embedded scripts. We serve them with
 * Content-Security-Policy: sandbox to prevent script execution.
 */
async function serveAsset(req, reply, jobId, filename) {
  if (requireUUID(jobId, reply)) return;

  const { rows } = await query(
    `SELECT u.data, u.content_type
     FROM designfast.job_uploads ju
     JOIN designfast.uploads u ON u.id = ju.upload_id
     WHERE ju.job_id = $1 AND u.filename = $2 AND ju.purpose = 'asset'
     LIMIT 1`,
    [jobId, filename]
  );

  if (rows.length === 0) {
    return reply.code(404).send();
  }

  const contentType = rows[0].content_type;

  // Security headers for all assets
  reply
    .header('Content-Type', contentType)
    .header('Cache-Control', 'public, max-age=31536000, immutable')
    .header('X-Content-Type-Options', 'nosniff');

  // SVG files can contain <script> tags — sandbox them to prevent XSS
  if (contentType === 'image/svg+xml') {
    reply.header('Content-Security-Policy', "sandbox; default-src 'none'; style-src 'unsafe-inline'");
  }

  return reply.send(rows[0].data);
}

export default async function (app) {
  // ── Asset routes (must be registered before the generic :filename routes) ──

  // GET /preview/:jobId/r/:revision/assets/:filename
  app.get('/preview/:jobId/r/:revision/assets/:filename', async (req, reply) => {
    const { jobId, filename } = req.params;
    return serveAsset(req, reply, jobId, filename);
  });

  // GET /preview/:jobId/assets/:filename
  app.get('/preview/:jobId/assets/:filename', async (req, reply) => {
    const { jobId, filename } = req.params;
    return serveAsset(req, reply, jobId, filename);
  });

  // ── File routes ────────────────────────────────────────────────────────────

  // GET /preview/:jobId/r/:revision/:filename — revision in path
  app.get('/preview/:jobId/r/:revision/:filename', async (req, reply) => {
    const { jobId, revision, filename } = req.params;
    return serveFile(req, reply, jobId, filename, revision);
  });

  // GET /preview/:jobId/:filename — no revision (serves latest)
  app.get('/preview/:jobId/:filename', async (req, reply) => {
    const { jobId, filename } = req.params;
    return serveFile(req, reply, jobId, filename, req.query.revision);
  });
}
