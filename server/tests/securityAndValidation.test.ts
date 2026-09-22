import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/db/connection.js';
import { validateBody, schemas } from '../src/middleware/validation.js';
import { extractRole, requireRoles, AuthenticatedRequest } from '../src/middleware/auth.js';

describe('Security, Validation & Token Auth Engine', () => {
  const db = getDb();

  test('validateBody should reject missing required fields with 400', () => {
    const middleware = validateBody(schemas.sendOtp);
    let statusCode = 200;
    let responseBody: any = null;
    let nextCalled = false;

    const req: any = { body: {} };
    const res: any = {
      status(code: number) {
        statusCode = code;
        return {
          json(payload: any) {
            responseBody = payload;
          }
        };
      }
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(responseBody?.error, 'VALIDATION_ERROR');
    assert.ok(responseBody?.details?.[0]?.includes('identifier'));
  });

  test('validateBody should reject disallowed enum values in reviewApplication', () => {
    const middleware = validateBody(schemas.reviewApplication);
    let statusCode = 200;
    let responseBody: any = null;
    let nextCalled = false;

    const req: any = { body: { action: 'INVALID_STATUS' } };
    const res: any = {
      status(code: number) {
        statusCode = code;
        return {
          json(payload: any) {
            responseBody = payload;
          }
        };
      }
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(nextCalled, false);
    assert.ok(responseBody?.details?.[0]?.includes('must be one of'));
  });

  test('validateBody should accept valid payload and invoke next()', () => {
    const middleware = validateBody(schemas.sendOtp);
    let nextCalled = false;

    const req: any = { body: { identifier: '123456789012' } };
    const res: any = {};
    const next = () => { nextCalled = true; };

    middleware(req, res, next);

    assert.strictEqual(nextCalled, true);
  });

  test('should persist token and role in auth_sessions and authenticate via Bearer token', () => {
    const testToken = `test-bearer-${Date.now()}`;
    const testSessionId = `test-session-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO auth_sessions (session_id, identifier, otp_code, expires_at, verified, applicant_id, token, role)
      VALUES (?, 'OFFICER-TEST', 'N/A', ?, 1, 'officer-test-01', ?, 'MOTA_ADMIN')
    `).run(testSessionId, expiresAt, testToken);

    // Verify session stored correctly in DB
    const saved = db.prepare('SELECT * FROM auth_sessions WHERE token = ?').get(testToken) as any;
    assert.ok(saved);
    assert.strictEqual(saved.token, testToken);
    assert.strictEqual(saved.role, 'MOTA_ADMIN');

    // Test extractRole with Bearer header
    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${testToken}` }
    } as any;
    let nextCalled = false;
    extractRole(req, {} as any, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.userRole, 'MOTA_ADMIN');
    assert.strictEqual(req.userId, 'officer-test-01');
  });

  test('requireRoles should grant access to allowed role and super admin', () => {
    const committeeGuard = requireRoles(['COMMITTEE']);

    // Allowed role
    let nextCalled1 = false;
    const req1: AuthenticatedRequest = { userRole: 'COMMITTEE' } as any;
    committeeGuard(req1, {} as any, () => { nextCalled1 = true; });
    assert.strictEqual(nextCalled1, true);

    // Super admin override
    let nextCalled2 = false;
    const req2: AuthenticatedRequest = { userRole: 'MOTA_ADMIN' } as any;
    committeeGuard(req2, {} as any, () => { nextCalled2 = true; });
    assert.strictEqual(nextCalled2, true);

    // Unauthorized role
    let statusCode = 200;
    let nextCalled3 = false;
    const req3: AuthenticatedRequest = { userRole: 'APPLICANT' } as any;
    const res3: any = {
      status(code: number) {
        statusCode = code;
        return { json: () => {} };
      }
    };
    committeeGuard(req3, res3, () => { nextCalled3 = true; });
    assert.strictEqual(nextCalled3, false);
    assert.strictEqual(statusCode, 403);
  });
});
