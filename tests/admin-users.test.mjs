import test from 'node:test';
import assert from 'node:assert/strict';

function loadHandler() {
  return import(`../api/admin-users.js?ts=${Date.now()}${Math.random()}`).then(m => m.default);
}

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
}

test('returns 500 when SUPERADMIN_EMAIL is missing', async () => {
  delete process.env.SUPERADMIN_EMAIL;
  const handler = await loadHandler();
  const req = { method: 'GET', headers: {} };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 500);
  assert.match(res.body.error, /SUPERADMIN_EMAIL/);
});

test('rejects unauthorized access with 403', async () => {
  process.env.SUPERADMIN_EMAIL = 'boss@example.com';
  const handler = await loadHandler();
  const req = { method: 'GET', headers: {} };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 403);
});
