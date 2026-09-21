import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { uid } from '../services/uid.js';

export const getFellowshipRecord = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const applicantId = req.params.applicantId;

    const fellowship = db.prepare(`
      SELECT f.*, s.name as scheme_name, s.code as scheme_code,
             ap.name as applicant_name, ap.course_level, ap.institute_name
      FROM fellowship_records f
      JOIN schemes s ON f.scheme_id = s.id
      JOIN applicants ap ON f.applicant_id = ap.id
      WHERE f.applicant_id = ?
    `).get(applicantId) as any;

    if (!fellowship) {
      res.status(404).json({ success: false, message: 'No fellowship award record found for this applicant' });
      return;
    }

    const reports = db.prepare(`
      SELECT * FROM continuation_reports
      WHERE fellowship_id = ?
      ORDER BY quarter_number ASC
    `).all(fellowship.id);

    // Calculate days remaining in 30-day statutory joining window
    const now = new Date();
    const deadline = new Date(fellowship.joining_deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      data: {
        ...fellowship,
        daysRemainingJoining: daysRemaining,
        isJoiningExpired: daysRemaining <= 0 && fellowship.joining_status !== 'CONFIRMED',
        continuationReports: reports
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitJoiningReport = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { fellowshipId, supervisorName, joiningReportUrl } = req.body;

    const flw = db.prepare('SELECT * FROM fellowship_records WHERE id = ?').get(fellowshipId) as any;
    if (!flw) {
      res.status(404).json({ success: false, message: 'Fellowship record not found' });
      return;
    }

    db.prepare(`
      UPDATE fellowship_records
      SET joining_status = 'CONFIRMED',
          supervisor_name = ?,
          joining_report_url = ?
      WHERE id = ?
    `).run(supervisorName || 'Department Research Supervisor', joiningReportUrl || '/uploads/joining_report.pdf', fellowshipId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'FELLOWSHIP',
      fellowshipId,
      'APPLICANT',
      'JOINING_REPORT_SUBMITTED',
      `Candidate submitted official joining report under Guide: ${supervisorName}`
    );

    // Notification
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, channel, title, message, is_read)
      VALUES (?, ?, 'IN_APP', 'Joining Report Confirmed', 'Your Ph.D./Fellowship joining formalities have been verified and confirmed by the INO.', 0)
    `).run(uid('notif'), flw.applicant_id);

    res.json({
      success: true,
      message: 'University joining report confirmed successfully. 30-day requirement satisfied.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitContinuationReport = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { fellowshipId, quarterNumber, academicYear, attendancePercentage, progressSummary } = req.body;

    const flw = db.prepare('SELECT * FROM fellowship_records WHERE id = ?').get(fellowshipId) as any;
    if (!flw) {
      res.status(404).json({ success: false, message: 'Fellowship record not found' });
      return;
    }

    if (attendancePercentage < 75) {
      res.status(400).json({
        success: false,
        message: 'Under MoTA fellowship guidelines, minimum 75% research attendance is mandatory to release quarterly stipends.'
      });
      return;
    }

    // Prevent duplicate disbursement for the same quarter
    const effectiveQuarter = Number(quarterNumber) || flw.current_quarter;
    const existingReport = db.prepare(
      'SELECT id FROM continuation_reports WHERE fellowship_id = ? AND quarter_number = ?'
    ).get(fellowshipId, effectiveQuarter) as any;

    if (existingReport) {
      res.status(409).json({
        success: false,
        message: `Continuation report for Quarter ${effectiveQuarter} has already been submitted (ID: ${existingReport.id}). Duplicate disbursements are prohibited under MoTA fellowship guidelines.`
      });
      return;
    }

    const reportId = uid('cont');
    const pfmsTxn = `PFMS-DBT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const stipendAmount = 93000; // 3 months * ₹31,000

    db.prepare(`
      INSERT INTO continuation_reports (
        id, fellowship_id, quarter_number, academic_year, attendance_percentage,
        progress_summary, stipend_amount, pfms_transaction_id, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DISBURSED', datetime('now'))
    `).run(
      reportId,
      fellowshipId,
      Number(quarterNumber) || flw.current_quarter,
      academicYear || '2026-2027',
      Number(attendancePercentage),
      progressSummary || 'Satisfactory quarterly research milestones met.',
      stipendAmount,
      pfmsTxn
    );

    // Advance quarter
    db.prepare(`
      UPDATE fellowship_records
      SET current_quarter = current_quarter + 1
      WHERE id = ?
    `).run(fellowshipId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'FELLOWSHIP',
      fellowshipId,
      'APPLICANT',
      'CONTINUATION_REPORT_DISBURSED',
      `Quarter ${quarterNumber} continuation certificate verified. PFMS DBT ${pfmsTxn} released for ₹${stipendAmount}.`
    );

    // Notification
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, channel, title, message, is_read)
      VALUES (?, ?, 'SMS', 'Quarterly Fellowship Stipend Credited', 'MoTA Alert: ₹93,000 credited to Aadhaar-seeded bank account via PFMS Ref: ${pfmsTxn}.', 0)
    `).run(uid('notif'), flw.applicant_id);

    res.json({
      success: true,
      message: `Quarter ${quarterNumber} continuation report approved. PFMS-DBT ₹${stipendAmount.toLocaleString('en-IN')} disbursed.`,
      pfmsTransactionId: pfmsTxn,
      stipendAmount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitThesis = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { fellowshipId, thesisTitle, synopsisSummary } = req.body;

    const flw = db.prepare('SELECT * FROM fellowship_records WHERE id = ?').get(fellowshipId) as any;
    if (!flw) {
      res.status(404).json({ success: false, message: 'Fellowship record not found' });
      return;
    }

    const archiveNumber = `MoTA-NTR-2026-TH-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      UPDATE fellowship_records
      SET thesis_status = 'ARCHIVED_IN_REPOSITORY',
          thesis_title = ?,
          thesis_archive_id = ?,
          final_disbursement_unlocked = 1
      WHERE id = ?
    `).run(thesisTitle, archiveNumber, fellowshipId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'FELLOWSHIP',
      fellowshipId,
      'APPLICANT',
      'THESIS_ARCHIVED_IN_REPOSITORY',
      `Ph.D. Thesis "${thesisTitle}" deposited into National Tribal Research Repository (Archive ID: ${archiveNumber}). Final grant unlocked.`
    );

    // Notification
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, channel, title, message, is_read)
      VALUES (?, ?, 'WHATSAPP', 'Ph.D. Thesis Successfully Archived', 'Congratulations! Your thesis has been archived in the National Repository (ID: ${archiveNumber}). Final 5th-year fellowship grant is now unlocked.', 0)
    `).run(uid('notif'), flw.applicant_id);

    res.json({
      success: true,
      message: 'Thesis successfully archived in National Tribal Research Repository. Final quarter disbursement unlocked.',
      archiveNumber
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
