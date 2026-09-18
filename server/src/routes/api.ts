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
import { chatWithGemini } from '../controllers/chatbotController.js';
import {
  runWaterfallSimulation,
  runNosSelectionSimulation,
  signOffSelection
} from '../controllers/selectionController.js';
import { getMoTaAnalytics } from '../controllers/analyticsController.js';
import { getDb } from '../db/connection.js';
import { extractRole, requireRoles } from '../middleware/auth.js';

const router = Router();

// Global role extraction & normalization for all incoming requests
router.use(extractRole);

// Schemes (Public discovery; Policy onboarding restricted to Super Admin)
router.get('/schemes', getAllSchemes);
router.get('/schemes/:id', getSchemeById);
router.post('/schemes', requireRoles(['MOTA_ADMIN']), createScheme);

// Scholarship Twin Simulator (Open citizen self-service)
router.post('/simulator/match', runSimulator);

// Applications
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', submitApplication);
router.post('/applications/:id/resubmit', resubmitDeficiency);

// Verification & Scrutiny (Restricted to Nodal & Ministry Officers)
router.post('/applications/:id/review', requireRoles(['INO', 'STATE_NODAL', 'MOTA_ADMIN']), reviewApplication);

// AI Document OCR & Verification
router.post('/documents/extract', extractAndVerifyDocument);

// AI Chatbot Assistant
router.post('/chatbot', chatWithGemini);

// Selection & Waterfalls
router.post('/selection/waterfall', runWaterfallSimulation);
router.get('/selection/nos', runNosSelectionSimulation);
router.post('/selection/sign-off', requireRoles(['COMMITTEE', 'MOTA_ADMIN']), signOffSelection);

// MoTA Analytics & Heatmaps (Restricted to Officers & Administrators)
router.get('/analytics', requireRoles(['INO', 'STATE_NODAL', 'COMMITTEE', 'MOTA_ADMIN']), getMoTaAnalytics);


// Applicant profiles list for demo switching
router.get('/applicants', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM applicants ORDER BY name ASC').all() as any[];
    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      aadhaarMasked: r.aadhaar_masked,
      category: r.category,
      isPwD: Boolean(r.is_pwd),
      isPVTG: Boolean(r.is_pvtg),
      gender: r.gender,
      annualIncome: r.annual_income ?? 0,
      state: r.state,
      district: r.district,
      instituteName: r.institute_name,
      courseLevel: r.course_level,
      academicPercentage: r.academic_percentage ?? 0
    }));
    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
