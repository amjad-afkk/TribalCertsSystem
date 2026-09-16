import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { parseSchemeRow } from './schemeController.js';
import { RulesEngine, ApplicantCriteria } from '../services/rulesEngine.js';

export const runSimulator = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM schemes WHERE is_active = 1').all();
    const schemes = rows.map(parseSchemeRow);

    const criteria: ApplicantCriteria = {
      category: req.body.category || 'ST_OTHER',
      annualIncome: Number(req.body.annualIncome) || 0,
      age: req.body.age ? Number(req.body.age) : undefined,
      academicPercentage: Number(req.body.academicPercentage) || 0,
      courseLevel: req.body.courseLevel || 'UG',
      isPwD: Boolean(req.body.isPwD),
      isPVTG: Boolean(req.body.isPVTG),
      qsRank: req.body.qsRank ? Number(req.body.qsRank) : undefined
    };

    const results = RulesEngine.simulateAllSchemes(schemes, criteria);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      criteria,
      matches: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
