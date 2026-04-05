import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, seedJobWithFiles, resetDb, ensureSchema, closeDb } from './helpers.js';

let app;

before(async () => {
  await ensureSchema();
  app = await createApp();
});

beforeEach(async () => {
  await resetDb();
});

after(async () => {
  await app.close();
  await closeDb();
});

describe('GET /api/jobs/:id', () => {
  it('returns job metadata', async () => {
    const { cookie, user } = await seedUser(app);
    const { jobId, generationId } = await seedJobWithFiles(user.id);

    const res = await app.inject({
      method: 'GET',
      url: `/api/jobs/${jobId}`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.id, jobId);
    assert.strictEqual(body.generationId, generationId);
    assert.strictEqual(body.styleKey, 'minimalist');
    assert.strictEqual(body.styleName, 'Minimalist');
    assert.strictEqual(body.model, 'claude-sonnet-4-6');
    assert.strictEqual(body.provider, 'anthropic');
    assert.strictEqual(body.version, 1);
    assert.strictEqual(body.status, 'done');
  });

  it('returns 404 for non-existent job', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/jobs/00000000-0000-0000-0000-000000000000',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.json().error, 'Job not found');
  });

  it('returns 404 for job owned by another user', async () => {
    const { user } = await seedUser(app);
    const { jobId } = await seedJobWithFiles(user.id);

    const { cookie: otherCookie } = await seedUser(app, { email: 'other@example.com' });

    const res = await app.inject({
      method: 'GET',
      url: `/api/jobs/${jobId}`,
      headers: { cookie: otherCookie },
    });

    assert.strictEqual(res.statusCode, 404);
  });
});

describe('GET /api/jobs/:id/files', () => {
  it('returns file list without content', async () => {
    const { cookie, user } = await seedUser(app);
    const { jobId } = await seedJobWithFiles(user.id);

    const res = await app.inject({
      method: 'GET',
      url: `/api/jobs/${jobId}/files`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.files.length, 2);

    for (const file of body.files) {
      assert.ok(file.id);
      assert.ok(file.filename);
      assert.ok(typeof file.sizeBytes === 'number');
      assert.ok(file.createdAt);
      // content must NOT be included
      assert.strictEqual(file.content, undefined);
    }

    const filenames = body.files.map(f => f.filename).sort();
    assert.deepStrictEqual(filenames, ['index.html', 'style.css']);
  });
});

describe('GET /api/jobs/:id/download', () => {
  it('returns a ZIP file', async () => {
    const { cookie, user } = await seedUser(app);
    const { jobId } = await seedJobWithFiles(user.id);

    const res = await app.inject({
      method: 'GET',
      url: `/api/jobs/${jobId}/download`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('application/zip'));
    assert.ok(res.headers['content-disposition'].includes(`designfast-${jobId}.zip`));
    // Body should be non-empty binary
    assert.ok(res.rawPayload.length > 0);
  });

  it('returns 404 when job has no files', async () => {
    const { cookie, user } = await seedUser(app);

    // Create job without files
    const { query: q } = await import('../db.js');
    const { rows: [gen] } = await q(
      `INSERT INTO designfast.generations (user_id, prompt, mode, theme_mode, status, job_count)
       VALUES ($1, 'test', 'landing', 'freestyle', 'done', 1) RETURNING id`,
      [user.id]
    );
    const { rows: [job] } = await q(
      `INSERT INTO designfast.jobs (generation_id, user_id, style_key, style_name, model, provider, version, status)
       VALUES ($1, $2, 'minimalist', 'Minimalist', 'claude-sonnet-4-6', 'anthropic', 1, 'done') RETURNING id`,
      [gen.id, user.id]
    );

    const res = await app.inject({
      method: 'GET',
      url: `/api/jobs/${job.id}/download`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.json().error, 'No files found');
  });
});
