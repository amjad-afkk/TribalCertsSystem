import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { UserRole } from '../types/index.js';

export const sendOtp = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { identifier, personaId } = req.body;

    if (!identifier && !personaId) {
      res.status(400).json({ success: false, message: 'Aadhaar number or Mobile number is required' });
      return;
    }

    const cleanId = String(identifier || '').replace(/[\s-]/g, '');

    // Check if matching pre-seeded applicant exists
    let applicant: any = null;
    if (personaId) {
      const pMap: Record<string, string> = {
        'applicant-pooja': 'app-user-01',
        'applicant-amitabh': 'app-user-05',
        'applicant-sunita': 'app-user-03'
      };
      const targetId = pMap[personaId] || 'app-user-01';
      applicant = db.prepare('SELECT * FROM applicants WHERE id = ?').get(targetId);
    } else if (cleanId.length === 12) {
      // Aadhaar match by last 4 digits
      const last4 = cleanId.slice(-4);
      applicant = db.prepare('SELECT * FROM applicants WHERE aadhaar_masked LIKE ?').get(`%${last4}`);
    } else if (cleanId.length === 10) {
      applicant = db.prepare('SELECT * FROM applicants WHERE phone LIKE ?').get(`%${cleanId}`);
    }

    // Default to Pooja Maravi if test citizen not specifically found
    if (!applicant) {
      applicant = db.prepare('SELECT * FROM applicants ORDER BY id ASC LIMIT 1').get();
    }

    const sessionId = `auth-sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Deterministic simulated OTP for seamless demo testing (always 123456)
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60s TTL

    db.prepare(`
      INSERT INTO auth_sessions (session_id, identifier, otp_code, expires_at, verified, applicant_id)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(sessionId, cleanId || applicant?.aadhaar_masked || '123456789012', otpCode, expiresAt, applicant?.id || 'app-user-01');

    const maskedPhone = applicant?.phone
      ? `${applicant.phone.slice(0, 4)}******${applicant.phone.slice(-3)}`
      : '+91 98765*****';

    const maskedAadhaar = applicant?.aadhaar_masked || `XXXX-XXXX-${cleanId.slice(-4) || '4123'}`;

    res.json({
      success: true,
      sessionId,
      maskedPhone,
      maskedAadhaar,
      otpPreview: otpCode,
      expiresInSeconds: 60,
      applicantName: applicant?.name || 'Citizen Applicant',
      message: `Simulated OTP dispatched via UIDAI / SMS Gateway to registered mobile ${maskedPhone}.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyOtp = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      res.status(400).json({ success: false, message: 'Session ID and 6-digit OTP are required' });
      return;
    }

    const session = db.prepare('SELECT * FROM auth_sessions WHERE session_id = ?').get(sessionId) as any;
    if (!session) {
      res.status(404).json({ success: false, message: 'Invalid or expired authentication session' });
      return;
    }

    if (new Date() > new Date(session.expires_at)) {
      res.status(410).json({ success: false, message: 'OTP has expired. Please request a new verification code.' });
      return;
    }

    if (session.otp_code !== String(otp).trim()) {
      res.status(401).json({ success: false, message: 'Incorrect OTP. Please enter the valid 6-digit verification code.' });
      return;
    }

    // Mark session verified
    db.prepare('UPDATE auth_sessions SET verified = 1 WHERE session_id = ?').run(sessionId);

    const applicant = db.prepare('SELECT * FROM applicants WHERE id = ?').get(session.applicant_id) as any;

    res.json({
      success: true,
      token: `jwt-sim-${session.applicant_id}-${Date.now()}`,
      user: {
        id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        aadhaarMasked: applicant.aadhaar_masked,
        category: applicant.category,
        isPwD: Boolean(applicant.is_pwd),
        isPVTG: Boolean(applicant.is_pvtg),
        role: 'APPLICANT' as UserRole,
        isKycVerified: true
      },
      message: 'Aadhaar e-KYC Verification Successful. Logged into Citizen Portal.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const officerLogin = (req: Request, res: Response): void => {
  try {
    const { designation, officerId, pin } = req.body;

    // Normalize clearance
    const roleMapping: Record<string, { role: UserRole; name: string; title: string }> = {
      'INO': {
        role: 'INO',
        name: 'Dr. A. K. Sharma',
        title: 'Institute Nodal Officer (Tier 1)'
      },
      'STATE_NODAL': {
        role: 'STATE_NODAL',
        name: 'Sh. Rajeshwar Toppo',
        title: 'State Nodal Officer (Jharkhand)'
      },
      'COMMITTEE': {
        role: 'COMMITTEE',
        name: 'Prof. S. R. Marandi',
        title: 'National Selection Committee Chair'
      },
      'MOTA_ADMIN': {
        role: 'MOTA_ADMIN',
        name: 'Joint Secretary (Scholarships)',
        title: 'Ministry of Tribal Affairs Super Administrator'
      }
    };

    const target = roleMapping[designation] || roleMapping['INO'];

    // Verify PIN (default demo PIN: 1234 or 123456)
    if (pin && pin !== '1234' && pin !== '123456') {
      res.status(401).json({ success: false, message: 'Invalid Government 2FA PIN. Use default: 1234' });
      return;
    }

    res.json({
      success: true,
      token: `officer-token-${target.role.toLowerCase()}-${Date.now()}`,
      user: {
        id: officerId || `OFFICER-${target.role}`,
        name: target.name,
        role: target.role,
        designationTitle: target.title,
        isKycVerified: true
      },
      message: `Authentication successful. Access granted with ${target.title} clearance.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
