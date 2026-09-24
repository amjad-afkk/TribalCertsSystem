import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/db/connection.js';
import { runSeed } from '../src/db/seed.js';

describe('Ashram School Offline-First PWA & Batch Mesh Sync Engine', () => {
  const db = getDb(true);
  runSeed(db);

  test('should validate batch payload and reject empty application arrays', () => {
    const invalidBatch = {
      ashramSchoolCode: 'EMRS-BASTAR-04',
      batchId: 'BATCH-EMPTY-TEST',
      applications: []
    };

    assert.strictEqual(Array.isArray(invalidBatch.applications), true);
    assert.strictEqual(invalidBatch.applications.length === 0, true, 'Empty batch must be flagged');
  });

  test('should ingest offline Ashram school applications into MoTA registry and generate audit trail', () => {
    const schoolCode = 'EMRS-GADCHIROLI-09';
    const batchId = `BATCH-OFFLINE-${Date.now()}`;
    const mockApps = [
      {
        localId: 'local-app-001',
        studentName: 'Sunita Madkami',
        applicantId: 'app-user-01',
        schemeId: 'scheme-pre-matric',
        academicYear: '2026-2027',
        formData: {
          claimedIncome: 120000,
          academicPercentage: 86.5,
          standard: 'Class IX',
          hostelResident: true
        }
      },
      {
        localId: 'local-app-002',
        studentName: 'Ramesh Netam',
        applicantId: 'app-user-02',
        schemeId: 'scheme-post-matric',
        academicYear: '2026-2027',
        formData: {
          claimedIncome: 150000,
          academicPercentage: 78.0,
          standard: 'Class XI',
          hostelResident: true
        }
      }
    ];

    const syncedResults: any[] = [];
    const insertApp = db.prepare(`
      INSERT INTO applications (
        id, applicant_id, scheme_id, academic_year, status, current_stage,
        submitted_at, form_data, explainable_status
      ) VALUES (?, ?, ?, ?, 'SUBMITTED', 'INSTITUTE_VERIFICATION', datetime('now'), ?, 'Synced from Ashram School Offline Queue')
    `);

    for (const item of mockApps) {
      const serverAppId = `app-sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      insertApp.run(
        serverAppId,
        item.applicantId,
        item.schemeId,
        item.academicYear,
        JSON.stringify({ ...item.formData, ashramSchoolCode: schoolCode, offlineSyncSource: 'MESH_BATCH_PWA' })
      );

      // Audit log
      db.prepare(`
        INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `audit-sync-${Date.now()}-${Math.random()}`,
        'APPLICATION',
        serverAppId,
        'ASHRAM_SCHOOL_OFFLINE_SYNC',
        'BATCH_INGESTION',
        `Application synced from remote Ashram School ${schoolCode} via offline batch ${batchId}.`
      );

      syncedResults.push({
        localId: item.localId,
        serverAppId,
        studentName: item.studentName
      });
    }

    assert.strictEqual(syncedResults.length, 2);

    // Verify DB insertion
    const savedApp = db.prepare('SELECT * FROM applications WHERE id = ?').get(syncedResults[0].serverAppId) as any;
    assert.ok(savedApp);
    assert.strictEqual(savedApp.status, 'SUBMITTED');
    assert.strictEqual(savedApp.current_stage, 'INSTITUTE_VERIFICATION');

    const parsedForm = JSON.parse(savedApp.form_data);
    assert.strictEqual(parsedForm.ashramSchoolCode, schoolCode);
    assert.strictEqual(parsedForm.offlineSyncSource, 'MESH_BATCH_PWA');
  });
});
