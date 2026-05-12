import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { buildStudentCode, countryPrefix, passportSuffix, timingSafeEquals } from '../api/validate-registration.js';

test('helper functions normalize and build expected code', () => {
  assert.equal(countryPrefix('Malaysia'), 'MA');
  assert.equal(passportSuffix('P-12345'), '45');
  assert.equal(buildStudentCode('Malaysia', 'P-12345'), 'PREMIUMMA45');
  assert.equal(timingSafeEquals('ABC', 'ABC'), true);
  assert.equal(timingSafeEquals('ABC', 'ABD'), false);
});

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
}

test('rejects non-student role', async () => {
  const req = { method: 'POST', body: { role: 'admin', registrationCode: 'x', country: 'MY', passportId: '12' } };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.valid, false);
});

test('accepts valid student code', async () => {
  const req = { method: 'POST', body: { role: 'student', registrationCode: 'PREMIUMMA45', country: 'Malaysia', passportId: 'P-12345' } };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.valid, true);
});
