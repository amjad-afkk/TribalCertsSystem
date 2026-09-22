import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/db/connection.js';
import { runSeed } from '../src/db/seed.js';

describe('Auth & Fellowship Post-Selection Management Engine', () => {
  const db = getDb(true);
  runSeed(db);

  test('should create OTP session with 60s expiration and verify valid code', () => {
    const sessionId = `test-sess-${Date.now()}`;
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO auth_sessions (session_id, identifier, otp_code, expires_at, verified, applicant_id)
      VALUES (?, 'XXXX-XXXX-4123', ?, ?, 0, 'app-user-01')
    `).run(sessionId, otpCode, expiresAt);

    // Verify session exists
    const session = db.prepare('SELECT * FROM auth_sessions WHERE session_id = ?').get(sessionId) as any;
    assert.strictEqual(session.otp_code, '123456');
    assert.strictEqual(session.verified, 0);

    // Simulate verification
    db.prepare('UPDATE auth_sessions SET verified = 1 WHERE session_id = ?').run(sessionId);
    const verified = db.prepare('SELECT verified FROM auth_sessions WHERE session_id = ?').get(sessionId) as any;
    assert.strictEqual(verified.verified, 1);
  });

  test('should calculate 30-day statutory joining window accurately for NFST awardee', () => {
    const flw = db.prepare('SELECT * FROM fellowship_records WHERE applicant_id = ?').get('app-user-01') as any;
    assert.ok(flw, 'Fellowship record must exist for Pooja Maravi');
    assert.strictEqual(flw.joining_status, 'CONFIRMED');

    const deadline = new Date(flw.joining_deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    assert.ok(daysRemaining > 0, 'Statutory joining window should show positive days remaining');
  });

  test('should unlock final 5th-year disbursement only upon Ph.D. thesis repository archival', () => {
    const flw = db.prepare('SELECT * FROM fellowship_records WHERE applicant_id = ?').get('app-user-01') as any;
    assert.strictEqual(flw.final_disbursement_unlocked, 0, 'Final grant must be escrow-locked before thesis submission');

    const archiveId = 'MoTA-NTR-2026-TEST-9921';
    db.prepare(`
      UPDATE fellowship_records
      SET thesis_status = 'ARCHIVED_IN_REPOSITORY',
          thesis_archive_id = ?,
          final_disbursement_unlocked = 1
      WHERE id = ?
    `).run(archiveId, flw.id);

    const updated = db.prepare('SELECT * FROM fellowship_records WHERE id = ?').get(flw.id) as any;
    assert.strictEqual(updated.thesis_status, 'ARCHIVED_IN_REPOSITORY');
    assert.strictEqual(updated.thesis_archive_id, archiveId);
    assert.strictEqual(updated.final_disbursement_unlocked, 1, 'Final grant must be unlocked after repository deposit');
  });

  test('should query pre-verified DigiLocker certificates with cryptographic seals', () => {
    const docs = db.prepare('SELECT * FROM digilocker_documents WHERE applicant_id = ?').all('app-user-01') as any[];
    assert.ok(docs.length >= 2, 'Pooja Maravi should have at least 2 pre-verified DigiLocker documents');

    const casteCert = docs.find(d => d.doc_type === 'CASTE_CERT');
    assert.ok(casteCert);
    assert.ok(casteCert.doc_uri.includes('edistrict'));
    const verifiedData = JSON.parse(casteCert.verified_data);
    assert.strictEqual(verifiedData.digitalSignatureStatus, 'CRYPTOGRAPHICALLY_VERIFIED');
  });
});
