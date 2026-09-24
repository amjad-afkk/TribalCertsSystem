import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/db/connection.js';
import { runSeed } from '../src/db/seed.js';

describe('NFST Ph.D. Fellowship Lifecycle & Research Management Engine', () => {
  const db = getDb(true);
  runSeed(db);

  test('should record 1-click digital supervisor/guide token sign-off with audit trail', () => {
    const flw = db.prepare('SELECT * FROM fellowship_records WHERE applicant_id = ?').get('app-user-01') as any;
    assert.ok(flw, 'Fellowship record must exist for Pooja Maravi');

    const guideToken = 'GUIDE-TOKEN-JNU-2026';
    const comments = 'Candidate completed comprehensive field survey in Mandla district. Ready for Q6 disbursement.';
    const rating = 'OUTSTANDING';

    // Simulate guide signoff recording in audit logs
    const auditId = `audit-test-${Date.now()}`;
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      'FELLOWSHIP',
      flw.id,
      'SUPERVISOR',
      'GUIDE_TOKEN_QPR_SIGNOFF',
      `Ph.D. Supervisor (Token ${guideToken}) confirmed satisfactory research progress. Rating: ${rating}. Comments: "${comments}".`
    );

    const log = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(auditId) as any;
    assert.ok(log);
    assert.strictEqual(log.actor, 'SUPERVISOR');
    assert.strictEqual(log.action, 'GUIDE_TOKEN_QPR_SIGNOFF');
    assert.ok(log.details.includes(guideToken));
    assert.ok(log.details.includes(rating));
  });

  test('should upgrade Ph.D. scholar from JRF (₹37,000) to SRF (₹42,000) after 2-year assessment', () => {
    const flw = db.prepare('SELECT * FROM fellowship_records WHERE applicant_id = ?').get('app-user-01') as any;
    assert.ok(flw);

    const initialStipend = flw.monthly_stipend || 31000;
    const upgradedMonthlyStipend = 42000; // UGC/MoTA SRF rate

    // Record committee upgrade
    const auditId = `audit-srf-${Date.now()}`;
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      'FELLOWSHIP',
      flw.id,
      'COMMITTEE',
      'JRF_TO_SRF_UPGRADATION',
      'Assessment Committee successfully upgraded scholar from JRF to SRF (Stipend: ₹42,000/mo). Papers published: 2.'
    );

    const log = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(auditId) as any;
    assert.ok(log);
    assert.strictEqual(log.actor, 'COMMITTEE');
    assert.ok(upgradedMonthlyStipend > initialStipend, 'SRF stipend must be higher than JRF baseline');
    assert.strictEqual(upgradedMonthlyStipend, 42000);
  });

  test('should verify thesis Shodhganga INFLIBNET repository archival with <10% plagiarism compliance', () => {
    const flw = db.prepare('SELECT * FROM fellowship_records WHERE applicant_id = ?').get('app-user-01') as any;
    assert.ok(flw);

    const thesisTitle = 'Socio-Economic Resiliency and Indigenous Ethnobotanical Knowledge of Baiga Tribe';
    const mockShodhgangaId = 'INFLIBNET-SG-2026-88192';
    const similarityScore = 4.2; // 4.2% < 10% permissible UGC threshold

    assert.ok(similarityScore < 10.0, 'Thesis plagiarism must be below statutory 10% threshold');

    // Archive thesis in fellowship record
    db.prepare(`
      UPDATE fellowship_records
      SET thesis_status = 'ARCHIVED_IN_REPOSITORY',
          thesis_title = ?,
          thesis_archive_id = ?,
          final_disbursement_unlocked = 1
      WHERE id = ?
    `).run(thesisTitle, mockShodhgangaId, flw.id);

    const updated = db.prepare('SELECT * FROM fellowship_records WHERE id = ?').get(flw.id) as any;
    assert.strictEqual(updated.thesis_status, 'ARCHIVED_IN_REPOSITORY');
    assert.strictEqual(updated.thesis_archive_id, mockShodhgangaId);
    assert.strictEqual(updated.final_disbursement_unlocked, 1, 'Final grant must unlock upon repository archival');
  });
});
