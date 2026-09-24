import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { DeduplicationEngine } from '../services/deduplication.js';
import { parseSchemeRow } from './schemeController.js';
import { uid } from '../services/uid.js';

export const getApplications = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { applicantId, schemeId, status, stage } = req.query;

    let query = `
      SELECT a.*,
             s.name as scheme_name, s.code as scheme_code, s.level as scheme_level,
             s.income_ceiling,
             ap.name as applicant_name, ap.category as applicant_category,
             ap.aadhaar_masked, ap.state as applicant_state, ap.institute_name
      FROM applications a
      JOIN schemes s ON a.scheme_id = s.id
      JOIN applicants ap ON a.applicant_id = ap.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (applicantId) {
      query += ' AND a.applicant_id = ?';
      params.push(applicantId);
    }
    if (schemeId) {
      query += ' AND a.scheme_id = ?';
      params.push(schemeId);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (stage) {
      query += ' AND a.current_stage = ?';
      params.push(stage);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 200';

    const rows = db.prepare(query).all(...params) as any[];

    // Batch fetch documents for all applications in a single query to eliminate N+1 overhead
    const appIds = rows.map(r => r.id);
    const docsByAppId: Record<string, any[]> = {};
    if (appIds.length > 0) {
      const placeholders = appIds.map(() => '?').join(',');
      const allDocs = db.prepare(`SELECT * FROM documents WHERE application_id IN (${placeholders})`).all(...appIds) as any[];
      for (const doc of allDocs) {
        if (!docsByAppId[doc.application_id]) {
          docsByAppId[doc.application_id] = [];
        }
        docsByAppId[doc.application_id].push(doc);
      }
    }

    const data = rows.map(r => {
      const documents = docsByAppId[r.id] || [];
      return {
        id: r.id,
        applicantId: r.applicant_id,
        applicantName: r.applicant_name,
        applicantCategory: r.applicant_category,
        applicantState: r.applicant_state,
        instituteName: r.institute_name,
        aadhaarMasked: r.aadhaar_masked,
        schemeId: r.scheme_id,
        schemeName: r.scheme_name,
        schemeCode: r.scheme_code,
        schemeLevel: r.scheme_level,
        incomeCeiling: r.income_ceiling,
        academicYear: r.academic_year,
        status: r.status,
        currentStage: r.current_stage,
        submittedAt: r.submitted_at,
        formData: JSON.parse(r.form_data || '{}'),
        documents: documents.map(d => ({
          id: d.id,
          docType: d.doc_type,
          fileName: d.file_name,
          fileUrl: d.file_url,
          ocrExtracted: d.ocr_extracted ? JSON.parse(d.ocr_extracted) : null,
          status: d.status,
          discrepancyNote: d.discrepancy_note
        })),
        explainableStatus: r.explainable_status,
        deficiencyReason: r.deficiency_reason,
        aiDiscrepancyScore: r.ai_discrepancy_score,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getApplicationById = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const appId = req.params.id;

    const row = db.prepare(`
      SELECT a.*,
             s.name as scheme_name, s.code as scheme_code, s.level as scheme_level,
             s.income_ceiling, s.age_ceiling, s.selection_method,
             ap.name as applicant_name, ap.category as applicant_category,
             ap.email as applicant_email, ap.phone as applicant_phone,
             ap.aadhaar_masked, ap.state as applicant_state, ap.district as applicant_district,
             ap.institute_name, ap.annual_income, ap.academic_percentage
      FROM applications a
      JOIN schemes s ON a.scheme_id = s.id
      JOIN applicants ap ON a.applicant_id = ap.id
      WHERE a.id = ?
    `).get(appId) as any;

    if (!row) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const documents = db.prepare('SELECT * FROM documents WHERE application_id = ?').all(appId) as any[];
    const stages = db.prepare('SELECT * FROM verification_stages WHERE application_id = ? ORDER BY timestamp ASC').all(appId);
    const audit = db.prepare('SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp ASC').all(appId);

    res.json({
      success: true,
      data: {
        id: row.id,
        applicant: {
          id: row.applicant_id,
          name: row.applicant_name,
          email: row.applicant_email,
          phone: row.applicant_phone,
          category: row.applicant_category,
          state: row.applicant_state,
          district: row.applicant_district,
          instituteName: row.institute_name,
          annualIncome: row.annual_income,
          academicPercentage: row.academic_percentage,
          aadhaarMasked: row.aadhaar_masked
        },
        scheme: {
          id: row.scheme_id,
          name: row.scheme_name,
          code: row.scheme_code,
          level: row.scheme_level,
          incomeCeiling: row.income_ceiling,
          selectionMethod: row.selection_method
        },
        academicYear: row.academic_year,
        status: row.status,
        currentStage: row.current_stage,
        submittedAt: row.submitted_at,
        formData: JSON.parse(row.form_data || '{}'),
        explainableStatus: row.explainable_status,
        deficiencyReason: row.deficiency_reason,
        aiDiscrepancyScore: row.ai_discrepancy_score,
        documents: documents.map(d => ({
          id: d.id,
          docType: d.doc_type,
          fileName: d.file_name,
          fileUrl: d.file_url,
          uploadedAt: d.uploaded_at,
          status: d.status,
          ocrExtracted: d.ocr_extracted ? JSON.parse(d.ocr_extracted) : null,
          discrepancyNote: d.discrepancy_note
        })),
        stages,
        auditLogs: audit
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitApplication = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { applicantId, schemeId, academicYear, formData, documents } = req.body;

    const schemeRow = db.prepare('SELECT * FROM schemes WHERE id = ?').get(schemeId) as any;
    if (!schemeRow) {
      return res.status(404).json({ success: false, message: 'Invalid scheme selected' });
    }
    const applicantRow = db.prepare('SELECT * FROM applicants WHERE id = ?').get(applicantId) as any;
    if (!applicantRow) {
      return res.status(404).json({ success: false, message: 'Applicant profile not found' });
    }

    // Run Deduplication check
    const dedup = DeduplicationEngine.checkApplicationConflict(
      db,
      applicantId,
      schemeRow.code,
      academicYear || '2026-2027',
      applicantRow.bank_account_hash
    );

    if (dedup.isBlocked) {
      return res.status(409).json({
        success: false,
        errorType: 'DEDUPLICATION_BLOCK',
        message: dedup.blockReason,
        conflictDetails: dedup
      });
    }

    const appId = uid(`appln-${schemeRow.code.toLowerCase()}`);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO applications (
        id, applicant_id, scheme_id, academic_year, status, current_stage,
        submitted_at, form_data, explainable_status, deficiency_reason, ai_discrepancy_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appId,
      applicantId,
      schemeId,
      academicYear || '2026-2027',
      'SUBMITTED',
      'INO_SCRUTINY',
      now,
      JSON.stringify(formData || {}),
      'Application successfully submitted. Routed to Institute Nodal Officer (INO) for initial document and enrollment scrutiny.',
      null,
      95.0
    );

    // Save attached documents if provided
    if (Array.isArray(documents)) {
      const docInsert = db.prepare(`
        INSERT INTO documents (
          id, application_id, doc_type, file_name, file_url,
          ocr_extracted, status, discrepancy_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const d of documents) {
        const ocrData = d.ocrExtracted || d.extracted;
        docInsert.run(
          uid('doc'),
          appId,
          d.docType,
          d.fileName,
          d.fileUrl || '/uploads/sample.pdf',
          ocrData ? JSON.stringify(ocrData) : null,
          d.status || 'OCR_VERIFIED',
          d.discrepancyNote || null
        );
      }
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'APPLICATION',
      appId,
      applicantRow.name,
      'APPLICATION_SUBMITTED',
      `Submitted application for ${schemeRow.name} (${schemeRow.code}). Deduplication verified clean.`
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: appId,
      dedupWarnings: dedup.warnings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const resubmitDeficiency = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const appId = req.params.id;
    const { explanation, newDocuments } = req.body;

    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId) as any;
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (app.status !== 'DEFICIENCY_FLAGGED') {
      return res.status(400).json({
        success: false,
        message: `Resubmission is only allowed when application status is DEFICIENCY_FLAGGED. Current status: ${app.status}.`
      });
    }

    // Determine which scrutiny tier flagged the deficiency so it returns to the right queue
    const lastFlagStage = db.prepare(`
      SELECT tier FROM verification_stages
      WHERE application_id = ? AND action = 'FLAGGED_DEFICIENCY'
      ORDER BY timestamp DESC LIMIT 1
    `).get(appId) as any;

    const returnStage = lastFlagStage?.tier === 'STATE_NODAL' ? 'STATE_SCRUTINY' : 'INO_SCRUTINY';

    db.prepare(`
      UPDATE applications
      SET status = 'RESUBMITTED',
          current_stage = ?,
          explainable_status = ?,
          deficiency_reason = NULL,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      returnStage,
      `Applicant resolved deficiency: "${explanation}". Resubmitted to ${returnStage === 'STATE_SCRUTINY' ? 'State Nodal Officer' : 'Institute Nodal Officer'} for verification priority review.`,
      appId
    );

    // Record stage timeline event
    db.prepare(`
      INSERT INTO verification_stages (
        id, application_id, tier, reviewer_id, reviewer_name, action, comments, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      uid('vstage'),
      appId,
      returnStage === 'STATE_SCRUTINY' ? 'STATE_NODAL' : 'INO',
      'APPLICANT',
      'Applicant Resubmission',
      'RESUBMITTED',
      explanation || 'Applicant provided clarified documents for deficiency clearance.'
    );

    // If new replacement documents are provided, save them and resolve previous flagged documents
    if (Array.isArray(newDocuments) && newDocuments.length > 0) {
      db.prepare(`
        UPDATE documents
        SET status = 'RESOLVED_BY_RESUBMISSION'
        WHERE application_id = ? AND status = 'DEFICIENCY_FLAGGED'
      `).run(appId);

      const docInsert = db.prepare(`
        INSERT INTO documents (
          id, application_id, doc_type, file_name, file_url,
          ocr_extracted, status, discrepancy_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const d of newDocuments) {
        const ocrData = d.ocrExtracted || d.extracted;
        docInsert.run(
          uid('doc'),
          appId,
          d.docType || 'INCOME_CERT',
          d.fileName || 'updated_document.pdf',
          d.fileUrl || '/uploads/sample_income_cert.pdf',
          ocrData ? JSON.stringify(ocrData) : null,
          d.status || 'RESUBMITTED_FOR_REVIEW',
          d.discrepancyNote || null
        );
      }
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'APPLICATION',
      appId,
      'APPLICANT',
      'DEFICIENCY_RESUBMITTED',
      `Applicant submitted updated clarification: ${explanation}`
    );

    res.json({ success: true, message: 'Deficiency resubmission received and queued for re-verification.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const batchSyncApplications = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { ashramSchoolCode, batchId, applications } = req.body;

    if (!Array.isArray(applications) || applications.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or empty applications batch' });
      return;
    }

    const schoolCode = ashramSchoolCode || 'EMRS-ASHRAM-DEFAULT';
    const effectiveBatchId = batchId || `BATCH-${Date.now()}`;
    const syncedRecords: any[] = [];

    const insertApp = db.prepare(`
      INSERT INTO applications (
        id, applicant_id, scheme_id, academic_year, status, current_stage,
        submitted_at, form_data, explainable_status, deficiency_reason
      ) VALUES (?, ?, ?, ?, 'SUBMITTED', 'INSTITUTE_VERIFICATION', datetime('now'), ?, 'Synced from Ashram School Offline Queue', NULL)
    `);

    for (const item of applications) {
      const appId = uid('app');
      const applicantId = item.applicantId || 'app-user-01';
      const schemeId = item.schemeId || 'scheme-pre-matric';
      const formData = typeof item.formData === 'string' ? item.formData : JSON.stringify({
        ...item.formData,
        ashramSchoolCode: schoolCode,
        offlineSyncSource: 'MESH_BATCH_PWA'
      });

      insertApp.run(
        appId,
        applicantId,
        schemeId,
        item.academicYear || '2026-2027',
        formData
      );

      // Audit log
      db.prepare(`
        INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        uid('audit'),
        'APPLICATION',
        appId,
        'ASHRAM_SCHOOL_OFFLINE_SYNC',
        'BATCH_INGESTION',
        `Application synced from remote Ashram School ${schoolCode} via offline batch ${effectiveBatchId}.`
      );

      syncedRecords.push({
        localId: item.localId || appId,
        serverAppId: appId,
        status: 'SYNCED_AND_QUEUED_FOR_INO',
        studentName: item.studentName || item.formData?.applicantName || 'Ashram Student'
      });
    }

    res.json({
      success: true,
      batchId: effectiveBatchId,
      ashramSchoolCode: schoolCode,
      syncedCount: syncedRecords.length,
      syncedRecords,
      syncTimestamp: new Date().toISOString(),
      message: `Successfully ingested ${syncedRecords.length} offline applications from Ashram School ${schoolCode} into MoTA central registry.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
