import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { uid } from '../services/uid.js';

export const reviewApplication = (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDb();
    const appId = req.params.id;
    const { tier, action, comments, reviewerId, reviewerName } = req.body;
    const userRole = req.userRole || 'INO';

    // Tier-level statutory clearance validation
    if (userRole === 'INO' && tier && tier !== 'INO') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Institute Nodal Officer (INO) clearance restricted to Tier 1 scrutiny only.'
      });
    }

    if (userRole === 'STATE_NODAL' && tier && tier !== 'STATE_NODAL') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'State Nodal Officer (SNO) clearance restricted to Tier 2 State scrutiny only.'
      });
    }

    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId) as any;
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let nextStatus = app.status;
    let nextStage = app.current_stage;
    let explainableStatus = app.explainable_status;
    let deficiencyReason: string | null = null;

    if (action === 'APPROVED') {
      if (tier === 'INO') {
        nextStatus = 'UNDER_SCRUTINY';
        nextStage = 'STATE_SCRUTINY';
        explainableStatus = 'Institute Nodal Officer (INO) has verified enrollment and bona fide student credentials. Forwarded to State/Ministry scrutiny.';
      } else if (tier === 'STATE_NODAL') {
        nextStatus = 'VERIFIED';
        nextStage = 'COMMITTEE_REVIEW';
        explainableStatus = 'State Nodal Officer scrutiny complete. Eligible and queued for Selection Committee merit review / quota allocation.';
      } else if (tier === 'MOTA_ADMIN') {
        nextStatus = 'SHORTLISTED';
        nextStage = 'SELECTION_FINALIZED';
        explainableStatus = 'MoTA administrative verification completed successfully.';
      }
    } else if (action === 'FLAGGED_DEFICIENCY') {
      nextStatus = 'DEFICIENCY_FLAGGED';
      nextStage = 'APPLICANT_RESUBMISSION';
      deficiencyReason = comments || 'Document inconsistency or clarification required.';
      explainableStatus = `Deficiency flagged by ${tier}: "${comments}". Application returned to applicant for resubmission.`;
    } else if (action === 'REJECTED') {
      nextStatus = 'REJECTED';
      nextStage = 'CLOSED';
      explainableStatus = `Application rejected by ${tier}. Reason: ${comments}`;
    }

    // Update application
    db.prepare(`
      UPDATE applications
      SET status = ?, current_stage = ?, explainable_status = ?,
          deficiency_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(nextStatus, nextStage, explainableStatus, deficiencyReason, appId);

    // Update document statuses to reflect scrutiny outcome
    if (action === 'APPROVED') {
      db.prepare(`
        UPDATE documents
        SET status = 'ACCEPTED'
        WHERE application_id = ? AND status != 'REJECTED'
      `).run(appId);
    } else if (action === 'REJECTED') {
      db.prepare(`
        UPDATE documents
        SET status = 'REJECTED'
        WHERE application_id = ?
      `).run(appId);
    }

    // Insert verification stage record
    const stageId = uid('vstage');
    db.prepare(`
      INSERT INTO verification_stages (
        id, application_id, tier, reviewer_id, reviewer_name, action, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      stageId,
      appId,
      tier || 'INO',
      reviewerId || 'REV-001',
      reviewerName || 'Nodal Verification Officer',
      action,
      comments || ''
    );

    // Insert audit log with explicit role recording
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'APPLICATION',
      appId,
      `${reviewerName || 'Nodal Officer'} (Role: ${userRole})`,
      `APPLICATION_${action}`,
      `Action ${action} taken at stage ${tier}. Notes: ${comments || 'No comments provided'}`
    );

    res.json({
      success: true,
      message: `Verification action ${action} recorded successfully`,
      newStatus: nextStatus,
      newStage: nextStage,
      explainableStatus
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const reviewDocument = (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDb();
    const docId = req.params.docId;
    const { status, discrepancyNote } = req.body;

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as any;
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    db.prepare(`
      UPDATE documents
      SET status = ?, discrepancy_note = ?
      WHERE id = ?
    `).run(status || 'ACCEPTED', discrepancyNote || null, docId);

    res.json({ success: true, message: `Document status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
