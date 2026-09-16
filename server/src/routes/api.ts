import { Router } from 'express';
import { getAllSchemes, getSchemeById, createScheme } from '../controllers/schemeController.js';
import { runSimulator } from '../controllers/simulatorController.js';
import {
  getApplications,
  getApplicationById,
  submitApplication,
  resubmitDeficiency
} from '../controllers/applicationController.js';
import { reviewApplication } from '../controllers/verificationController.js';
import { extractAndVerifyDocument } from '../controllers/documentController.js';
import {
  runWaterfallSimulation,
  runNosSelectionSimulation,
  signOffSelection
} from '../controllers/selectionController.js';
import { getMoTaAnalytics } from '../controllers/analyticsController.js';
import { getDb } from '../db/connection.js';

const router = Router();

// Schemes
router.get('/schemes', getAllSchemes);
router.get('/schemes/:id', getSchemeById);
router.post('/schemes', createScheme);

// Scholarship Twin Simulator
router.post('/simulator/match', runSimulator);

// Applications
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', submitApplication);
router.post('/applications/:id/resubmit', resubmitDeficiency);

// Verification & Scrutiny
router.post('/applications/:id/review', reviewApplication);

// AI Document OCR & Verification
router.post('/documents/extract', extractAndVerifyDocument);

// Selection & Waterfalls
router.post('/selection/waterfall', runWaterfallSimulation);
router.get('/selection/nos', runNosSelectionSimulation);
router.post('/selection/sign-off', signOffSelection);

// MoTA Analytics & Heatmaps
router.get('/analytics', getMoTaAnalytics);

// Applicant profiles list for demo switching
router.get('/applicants', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM applicants ORDER BY name ASC').all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
