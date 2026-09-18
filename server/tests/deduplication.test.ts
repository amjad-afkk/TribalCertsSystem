import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { getDb, closeDb } from '../src/db/connection.js';
import { runSeed } from '../src/db/seed.js';
import { DeduplicationEngine } from '../src/services/deduplication.js';

describe('DeduplicationEngine One Nation One Scholarship Fraud Protection', () => {
  let db: any;

  before(() => {
    // In-memory isolated DB for testing
    db = getDb(true);
    runSeed(db);

    // Seed active Post-Matric application for app-user-02 for deduplication conflict testing
    db.prepare(`
      INSERT INTO applications (
        id, applicant_id, scheme_id, academic_year, status, current_stage, form_data, explainable_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'app-test-post-matric-02',
      'app-user-02',
      'scheme-post-matric',
      '2026-2027',
      'APPROVED',
      'DBT_DISBURSEMENT',
      JSON.stringify({ candidateName: 'Ramesh Kumar Oraon' }),
      'Application verified and cleared for DBT disbursement'
    );
  });

  after(() => {
    closeDb();
  });

  test('should detect and block mutually exclusive scheme enrollment (Top Class vs Post-Matric)', () => {
    // Ramesh Oraon (app-user-02) already has an active Post-Matric application (BVOBC)
    // If Ramesh tries to apply for Top Class (A023B), it should be blocked
    const result = DeduplicationEngine.checkApplicationConflict(
      db,
      'app-user-02',
      'A023B', // Top Class
      '2026-2027',
      'bank_hash_pnb_9182'
    );

    assert.strictEqual(result.isBlocked, true);
    assert.strictEqual(result.conflictType, 'MUTUALLY_EXCLUSIVE_SCHEME');
    assert.ok(result.blockReason?.includes('One Nation One Scholarship ID Conflict'));
  });

  test('should allow submission for clean applicant with no conflicting applications', () => {
    // Create a brand new applicant
    const newId = 'test-clean-user-99';
    db.prepare(`
      INSERT INTO applicants (
        id, name, email, phone, aadhaar_masked, aadhaar_hash,
        category, is_pwd, is_pvtg, gender, annual_income,
        state, district, institute_name, course_level, academic_percentage,
        bank_account_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId, 'Clean User', 'clean@test.gov.in', '9999999999',
      'XXXX-XXXX-0099', 'hash_aadhaar_clean_0099',
      'ST_OTHER', 0, 0, 'MALE', 150000,
      'Odisha', 'Sambalpur', 'Sambalpur University', 'UG', 72.0,
      'bank_hash_clean_0099'
    );

    const result = DeduplicationEngine.checkApplicationConflict(
      db,
      newId,
      'BVOBC',
      '2026-2027',
      'bank_hash_clean_0099'
    );

    assert.strictEqual(result.isBlocked, false);
    assert.strictEqual(result.hasWarnings, false);
    assert.strictEqual(result.conflictType, 'NONE');
  });

  test('should flag high-risk warning when same bank account is reused across different applicants', () => {
    // Pooja Maravi has bank account hash 'bank_hash_sbi_4412'
    // A different applicant submits the same bank account
    const result = DeduplicationEngine.checkApplicationConflict(
      db,
      'app-user-02', // Ramesh Oraon
      'BPVGK',
      '2026-2027',
      'bank_hash_sbi_4412' // Pooja's bank account
    );

    assert.strictEqual(result.hasWarnings, true);
    assert.ok(result.warnings.some(w => w.includes('High-Risk Fraud Signal')));
  });
});
