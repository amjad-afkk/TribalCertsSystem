import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { parseSchemeRow } from './schemeController.js';
import { RulesEngine, ApplicantCriteria } from '../services/rulesEngine.js';
import { CareerRoadmapService } from '../services/careerRoadmapService.js';

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
    const roadmap = CareerRoadmapService.generateRoadmap({
      category: criteria.category,
      courseLevel: criteria.courseLevel || 'UG',
      academicPercentage: criteria.academicPercentage,
      annualIncome: criteria.annualIncome,
      age: criteria.age || 22,
      isPwD: criteria.isPwD,
      isPVTG: criteria.isPVTG
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      criteria,
      matches: results,
      roadmap
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCareerRoadmap = (req: Request, res: Response) => {
  try {
    const roadmap = CareerRoadmapService.generateRoadmap({
      category: req.body.category || 'ST_OTHER',
      courseLevel: req.body.courseLevel || 'UG',
      academicPercentage: Number(req.body.academicPercentage) || 60,
      annualIncome: Number(req.body.annualIncome) || 150000,
      age: Number(req.body.age) || 22,
      isPwD: Boolean(req.body.isPwD),
      isPVTG: Boolean(req.body.isPVTG)
    });

    res.json({
      success: true,
      data: roadmap
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
