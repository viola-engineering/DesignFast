import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../../examples');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

export default async function (app) {
  // GET /api/examples — list all available examples
  app.get('/api/examples', async (req, reply) => {
    if (!existsSync(EXAMPLES_DIR)) {
      return { examples: [] };
    }

    const examples = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        const styleDir = join(EXAMPLES_DIR, d.name);
        const hasHtml = existsSync(join(styleDir, 'index.html'));
        const hasThumbnail = existsSync(join(styleDir, 'thumbnail.png'));
        return {
          styleKey: d.name,
          hasHtml,
          hasThumbnail,
        };
      })
      .filter(e => e.hasHtml);

    return { examples };
  });

  // GET /api/examples/:styleKey/:filename — serve example files
  app.get('/api/examples/:styleKey/:filename', async (req, reply) => {
    const { styleKey, filename } = req.params;

    // Sanitize inputs to prevent path traversal
    if (styleKey.includes('..') || filename.includes('..')) {
      return reply.code(400).send({ error: 'Invalid path' });
    }

    const filePath = join(EXAMPLES_DIR, styleKey, filename);

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return reply.code(404).send({ error: 'File not found' });
    }

    const ext = extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const content = readFileSync(filePath);
    reply.header('Content-Type', contentType);
    reply.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    return reply.send(content);
  });

  // GET /api/examples/:styleKey/download — download ZIP of example
  app.get('/api/examples/:styleKey/download', async (req, reply) => {
    const { styleKey } = req.params;

    // Sanitize input
    if (styleKey.includes('..')) {
      return reply.code(400).send({ error: 'Invalid style' });
    }

    const styleDir = join(EXAMPLES_DIR, styleKey);

    if (!existsSync(styleDir) || !statSync(styleDir).isDirectory()) {
      return reply.code(404).send({ error: 'Example not found' });
    }

    const files = readdirSync(styleDir).filter(f => {
      const ext = extname(f).toLowerCase();
      return ['.html', '.css', '.js'].includes(ext);
    });

    if (files.length === 0) {
      return reply.code(404).send({ error: 'No files found' });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${styleKey}-example.zip"`,
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(reply.raw);

    for (const file of files) {
      const content = readFileSync(join(styleDir, file));
      archive.append(content, { name: file });
    }

    await archive.finalize();
    return reply;
  });
}
