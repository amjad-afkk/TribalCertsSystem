import { Router } from 'express';
import { getAllSchemes, getSchemeById, createScheme } from '../controllers/schemeController.js';
import { runSimulator, getCareerRoadmap } from '../controllers/simulatorController.js';
import {
  getApplications,
  getApplicationById,
  submitApplication,
  resubmitDeficiency
} from '../controllers/applicationController.js';
import { reviewApplication, reviewDocument } from '../controllers/verificationController.js';
import { extractAndVerifyDocument } from '../controllers/documentController.js';
import { chatWithGemini } from '../controllers/chatbotController.js';
import {
  runWaterfallSimulation,
  runNosSelectionSimulation,
  signOffSelection
} from '../controllers/selectionController.js';
import { getMoTaAnalytics } from '../controllers/analyticsController.js';
import { sendOtp, verifyOtp, officerLogin } from '../controllers/authController.js';
import {
  getFellowshipRecord,
  submitJoiningReport,
  submitContinuationReport,
  submitThesis
} from '../controllers/fellowshipController.js';
import { getDigiLockerDocuments, verifyCertificateRegistry } from '../controllers/digilockerController.js';
import { getNotifications, markNotificationRead, sendTestNudge } from '../controllers/notificationController.js';
import { getDb } from '../db/connection.js';
import { extractRole, requireRoles } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';

const router = Router();

// Global role extraction & normalization for all incoming requests
router.use(extractRole);

// Authentication & Identity (Citizen Aadhaar OTP + Officer SSO)
router.post('/auth/send-otp', validateBody(schemas.sendOtp), sendOtp);
router.post('/auth/verify-otp', validateBody(schemas.verifyOtp), verifyOtp);
router.post('/auth/officer-login', validateBody(schemas.officerLogin), officerLogin);

// Post-Selection Fellowship Lifecycle (FR-7.1 to FR-7.5)
router.get('/fellowship/:applicantId', getFellowshipRecord);
router.post('/fellowship/joining', validateBody(schemas.submitJoining), submitJoiningReport);
router.post('/fellowship/continuation', validateBody(schemas.submitContinuation), submitContinuationReport);
router.post('/fellowship/thesis', validateBody(schemas.submitThesis), submitThesis);

// DigiLocker Integration & QR Verification (FR-1.2, Section 5.4)
router.get('/digilocker/documents', getDigiLockerDocuments);
router.get('/digilocker/documents/:applicantId', getDigiLockerDocuments);
router.post('/digilocker/verify-certificate', verifyCertificateRegistry);

// Multi-Channel Notifications (FR-4.6, §6.8)
router.get('/notifications', getNotifications);
router.get('/notifications/:recipientId', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications/test-nudge', sendTestNudge);

// Schemes (Public discovery; Policy onboarding restricted to Super Admin)
router.get('/schemes', getAllSchemes);
router.get('/schemes/:id', getSchemeById);
router.post('/schemes', requireRoles(['MOTA_ADMIN']), validateBody(schemas.createScheme), createScheme);

// Scholarship Twin Simulator (Open citizen self-service)
router.post('/simulator/match', validateBody(schemas.simulatorMatch), runSimulator);
router.post('/simulator/roadmap', getCareerRoadmap);

// Applications
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', validateBody(schemas.submitApplication), submitApplication);
router.post('/applications/:id/resubmit', resubmitDeficiency);

// Verification & Scrutiny (Restricted to Nodal & Ministry Officers)
router.post('/applications/:id/review', requireRoles(['INO', 'STATE_NODAL', 'MOTA_ADMIN']), validateBody(schemas.reviewApplication), reviewApplication);
router.patch('/documents/:docId/status', requireRoles(['INO', 'STATE_NODAL', 'MOTA_ADMIN']), validateBody(schemas.reviewDocument), reviewDocument);

// AI Document OCR & Verification
router.post('/documents/extract', validateBody(schemas.documentExtract), extractAndVerifyDocument);

// AI Chatbot Assistant
router.post('/chatbot', validateBody(schemas.chatbot), chatWithGemini);

// Selection & Waterfalls
router.post('/selection/waterfall', validateBody(schemas.waterfall), runWaterfallSimulation);
router.get('/selection/nos', runNosSelectionSimulation);
router.post('/selection/sign-off', requireRoles(['COMMITTEE', 'MOTA_ADMIN']), validateBody(schemas.selectionSignOff), signOffSelection);

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
