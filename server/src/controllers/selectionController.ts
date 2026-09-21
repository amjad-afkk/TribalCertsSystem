import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { SelectionEngine, CandidateForSelection } from '../services/selectionEngine.js';
import { NosService } from '../services/nosService.js';
import { uid } from '../services/uid.js';

export const runWaterfallSimulation = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { schemeCode = 'ARG45', customCandidates } = req.body;

    let candidates: CandidateForSelection[] = [];

    if (Array.isArray(customCandidates) && customCandidates.length > 0) {
      candidates = customCandidates;
    } else {
      // Pull real applicants from database + add synthetic pool for rich waterfall demonstration
      const dbApplicants = db.prepare(`
        SELECT id, name, category, is_pwd, is_pvtg, gender, academic_percentage
        FROM applicants
      `).all() as any[];

      candidates = dbApplicants.map(a => ({
        applicantId: a.id,
        applicationId: `appln-sim-${a.id}`,
        name: a.name,
        category: a.category,
        isPwD: Boolean(a.is_pwd),
        isPVTG: Boolean(a.is_pvtg),
        gender: a.gender,
        meritScore: a.academic_percentage
      }));

      // Generate a realistic cohort of 120 applicants to demonstrate the spillover cascade
      const names = [
        'Anjali Munda', 'Birsa Ekka', 'Chhaya Tirkey', 'Deepak Kujur', 'Eshita Boro',
        'Gopal Hansda', 'Hemant Murmu', 'Indira Jamatia', 'Jatin Rabha', 'Kiran Toppo',
        'Lata Kharia', 'Manish Manki', 'Nandini Koya', 'Omkar Santhal', 'Pallavi Bhil',
        'Ratan Mina', 'Shanti Garo', 'Tarun Khasi', 'Urmila Gond', 'Vikas Lepcha'
      ];

      for (let i = 0; i < 80; i++) {
        const randName = `${names[i % names.length]} (${i + 1})`;
        const isPwD = i < 4; // Intentionally fewer PwD candidates to force spillover!
        const isPVTG = !isPwD && i < 15; // Intentionally fewer PVTG to demonstrate waterfall!
        const isFemale = i % 2 === 0;

        candidates.push({
          applicantId: `cand-gen-${i}`,
          applicationId: `appln-gen-${i}`,
          name: randName,
          category: isPwD ? 'DIVYANGJAN' : isPVTG ? 'PVTG' : isFemale ? 'FEMALE_ST' : 'ST_OTHER',
          isPwD,
          isPVTG,
          gender: isFemale ? 'FEMALE' : 'MALE',
          meritScore: +(65 + Math.random() * 32).toFixed(1)
        });
      }
    }

    const waterfallResult = SelectionEngine.runNfstWaterfall(candidates);

    res.json({
      success: true,
      data: waterfallResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const runNosSelectionSimulation = (req: Request, res: Response) => {
  try {
    const db = getDb();

    // Sample candidate pool for NOS demonstration (Sunita Soren links to real DB appln-nos-03)
    const candidates = [
      {
        applicantId: 'app-user-03',
        applicationId: 'appln-nos-03',
        name: 'Sunita Soren',
        category: 'FEMALE_ST' as const,
        isPwD: false,
        isPVTG: false,
        gender: 'FEMALE' as const,
        meritScore: 84.5,
        university: 'University of Oxford',
        qsRank: 3,
        hasUnconditionalAdmit: true,
        hasOfferLetter: true,
        discipline: 'STEM' as const
      },
      {
        applicantId: 'nos-cand-02',
        applicationId: 'appln-nos-cand-02',
        name: 'Rajesh Munda',
        category: 'ST_OTHER' as const,
        isPwD: false,
        isPVTG: false,
        gender: 'MALE' as const,
        meritScore: 82.0,
        university: 'Massachusetts Institute of Technology (MIT)',
        qsRank: 1,
        hasUnconditionalAdmit: true,
        hasOfferLetter: true,
        discipline: 'STEM' as const
      },
      {
        applicantId: 'nos-cand-03',
        applicationId: 'appln-nos-cand-03',
        name: 'Anita Kerketta',
        category: 'FEMALE_ST' as const,
        isPwD: false,
        isPVTG: false,
        gender: 'FEMALE' as const,
        meritScore: 76.5,
        university: 'The University of Melbourne',
        qsRank: 14,
        hasUnconditionalAdmit: false,
        hasOfferLetter: true,
        discipline: 'AGRI_MED' as const
      },
      {
        applicantId: 'nos-cand-04',
        applicationId: 'appln-nos-cand-04',
        name: 'Dinesh Gond',
        category: 'PVTG' as const,
        isPwD: false,
        isPVTG: true,
        gender: 'MALE' as const,
        meritScore: 71.0,
        university: 'Technical University of Munich',
        qsRank: 45,
        hasUnconditionalAdmit: false,
        hasOfferLetter: true,
        discipline: 'STEM' as const
      },
      {
        applicantId: 'nos-cand-05',
        applicationId: 'appln-nos-cand-05',
        name: 'Priyanka Minz',
        category: 'FEMALE_ST' as const,
        isPwD: false,
        isPVTG: false,
        gender: 'FEMALE' as const,
        meritScore: 79.2,
        university: 'University of Leeds',
        qsRank: 82,
        hasUnconditionalAdmit: false,
        hasOfferLetter: false,
        discipline: 'HUMANITIES' as const
      }
    ];

    const result = SelectionEngine.runNosSelection(candidates, 20);

    // Attach forex calculation to each candidate using their actual university country
    const enrichedSelections = result.selections.map(s => {
      // Determine country: check QS university data, then fall back to heuristics
      let country = 'United States';
      const uni = (s as any).university || '';
      const qsEntry = db.prepare('SELECT country FROM qs_universities WHERE name LIKE ? LIMIT 1').get(`%${uni.split('(')[0].trim()}%`) as any;
      if (qsEntry) {
        country = qsEntry.country;
      }
      const forex = NosService.computeForexAllowance(country);

      // Check if application is already signed off in DB
      const appRecord = db.prepare('SELECT status FROM applications WHERE id = ?').get(s.applicationId) as any;
      const isSignedOff = appRecord?.status === 'SELECTED' || appRecord?.status === 'DISBURSED';

      return {
        ...s,
        forexDetails: forex,
        isSignedOff: Boolean(isSignedOff)
      };
    });

    res.json({
      success: true,
      data: {
        ...result,
        selections: enrichedSelections
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const signOffSelection = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { schemeId, applicationId, committeeMember, comments } = req.body;
    const actorRole = (req as any).userRole || 'COMMITTEE';

    const targetId = applicationId || schemeId;
    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'applicationId or schemeId is required for committee sign-off'
      });
    }

    if (applicationId) {
      db.prepare(`
        UPDATE applications
        SET status = 'SELECTED',
            current_stage = 'SELECTION_FINALIZED',
            explainable_status = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        `Selection Committee has formally signed off and approved fellowship award. Next: PFMS-DBT disbursement mandate generation.`,
        applicationId
      );

      // Create formal selection record entry
      const app = db.prepare('SELECT applicant_id, scheme_id FROM applications WHERE id = ?').get(applicationId) as any;
      if (app) {
        db.prepare(`
          INSERT OR IGNORE INTO selection_records (
            id, scheme_id, application_id, applicant_id, quota_tier, original_tier,
            is_spillover, merit_rank, committee_signed_off, signed_off_at,
            disbursement_amount_inr, status
          ) VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, datetime('now'), 0, 'CONFIRMED')
        `).run(
          uid('sel'),
          app.scheme_id,
          applicationId,
          app.applicant_id,
          'COMMITTEE_APPROVED',
          'COMMITTEE_APPROVED'
        );
      }
    }

    // Audit log with actor role
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'APPLICATION',
      targetId,
      `${committeeMember || 'SELECTION_COMMITTEE_CHAIR'} (Role: ${actorRole})`,
      'COMMITTEE_SIGN_OFF',
      `Selection finalized by committee. Rationale: ${comments || 'Merit and reservation criteria satisfied.'}`
    );

    res.json({
      success: true,
      message: 'Selection confirmed and signed off by Selection Committee with full audit trail.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
