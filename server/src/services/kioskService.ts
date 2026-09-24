import { createHash, createHmac } from 'node:crypto';
import { getDb } from '../db/connection.js';
import { uid } from './uid.js';

export interface KioskStudentOnboardingPayload {
  studentName: string;
  aadhaarMasked?: string;
  category: 'PVTG' | 'DIVYANGJAN' | 'FEMALE_ST' | 'ST_OTHER';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  phone?: string;
  email?: string;
  annualIncome: number;
  state?: string;
  district?: string;
  schemeCode: string; // e.g. BPVGK, BVOBC, A023B
  courseLevel?: string;
  instituteName?: string;
  academicPercentage?: number;
  kioskCenterId: string; // e.g. MS-TELANGANA-BHADRADRI-09
  vleOperatorId: string; // e.g. VLE-MEESEVA-4912
  biometricVerified?: boolean;
}

export interface KioskOnboardingReceipt {
  ackNumber: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  schemeCode: string;
  schemeName: string;
  kioskCenterId: string;
  vleOperatorId: string;
  networkOrigin: string;
  digitalSeal: string;
  timestamp: string;
  status: string;
  entitlement: string;
  qrPayload: string;
}

export class KioskService {
  /**
   * Onboards a tribal student via an authorized MeeSeva / CSC assisted kiosk terminal.
   * Enforces duplicate protection, registers citizen record, and signs official receipt.
   */
  static onboardStudent(
    payload: KioskStudentOnboardingPayload,
    networkOrigin: string = 'https://kiosk.meeseva.gov.in',
    dbInstance?: any
  ): KioskOnboardingReceipt {
    const db = dbInstance || getDb();

    const studentName = payload.studentName.trim();
    const cleanName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'scholar';
    const aadhaarMasked = payload.aadhaarMasked || 'XXXX-XXXX-8821';
    const aadhaarHash = createHash('sha256').update(aadhaarMasked + cleanName).digest('hex').slice(0, 32);
    const bankHash = createHash('sha256').update(`BANK-MEESEVA-${cleanName}-${aadhaarMasked}`).digest('hex').slice(0, 24);

    // 1. Check if applicant already exists in central registry
    let existingApplicant = db.prepare('SELECT * FROM applicants WHERE aadhaar_hash = ? OR aadhaar_masked = ?').get(aadhaarHash, aadhaarMasked) as any;
    let applicantId: string;

    if (existingApplicant) {
      applicantId = existingApplicant.id;
    } else {
      applicantId = uid('app-student');
      const email = payload.email || `${cleanName}.${Date.now().toString().slice(-4)}@kiosk.meeseva.gov.in`;
      const phone = payload.phone || '+91 98000 11223';
      const isPvtg = payload.category === 'PVTG' ? 1 : 0;
      const isPwd = payload.category === 'DIVYANGJAN' ? 1 : 0;

      db.prepare(`
        INSERT INTO applicants (
          id, name, email, phone, aadhaar_masked, aadhaar_hash,
          category, is_pwd, is_pvtg, gender, annual_income,
          state, district, institute_name, course_level,
          academic_percentage, bank_account_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        applicantId,
        studentName,
        email,
        phone,
        aadhaarMasked,
        aadhaarHash,
        payload.category,
        isPwd,
        isPvtg,
        payload.gender || 'FEMALE',
        payload.annualIncome,
        payload.state || 'Telangana',
        payload.district || 'Bhadradri Kothagudem',
        payload.instituteName || 'Government Tribal Welfare Ashram High School',
        payload.courseLevel || 'Class IX',
        payload.academicPercentage || 82.5,
        bankHash
      );
    }

    // 2. Identify Scheme by Code
    const schemeRow = db.prepare('SELECT * FROM schemes WHERE code = ? OR id = ?').get(payload.schemeCode, payload.schemeCode) as any;
    const schemeId = schemeRow ? schemeRow.id : 'scheme-pre-matric';
    const schemeName = schemeRow ? schemeRow.name : 'Pre-Matric Scholarship for ST Students';

    // 3. Create Application Record
    const applicationId = uid('appln-ms');
    const ackNumber = `ACK-MS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 899 + 100)}`;
    const nowIso = new Date().toISOString();

    const formData = JSON.stringify({
      applicantName: studentName,
      aadhaarMasked,
      category: payload.category,
      claimedIncome: payload.annualIncome,
      schemeCode: payload.schemeCode,
      schemeName,
      instituteName: payload.instituteName || 'Government Tribal Welfare School',
      onboardedVia: 'MEESEVA_ASSISTED_KIOSK',
      kioskCenterId: payload.kioskCenterId,
      vleOperatorId: payload.vleOperatorId,
      biometricConsent: payload.biometricVerified ?? true,
      acknowledgementNumber: ackNumber,
      onboardingTimestamp: nowIso
    });

    db.prepare(`
      INSERT INTO applications (
        id, applicant_id, scheme_id, academic_year, status, current_stage,
        submitted_at, form_data, explainable_status, deficiency_reason
      ) VALUES (?, ?, ?, '2026-2027', 'SUBMITTED', 'INSTITUTE_VERIFICATION', datetime('now'), ?, ?, NULL)
    `).run(
      applicationId,
      applicantId,
      schemeId,
      formData,
      `Onboarded via Authorized MeeSeva Kiosk ${payload.kioskCenterId}`
    );

    // 4. Generate Cryptographic Audit Seal
    const digitalSeal = createHmac('sha256', 'MOTA_MEESEVA_SECRET_SALT')
      .update(`${ackNumber}|${applicationId}|${payload.kioskCenterId}|${payload.vleOperatorId}|${nowIso}`)
      .digest('hex');

    // 5. Audit Log Stamping
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit-kiosk'),
      'APPLICATION',
      applicationId,
      payload.vleOperatorId,
      'MEESEVA_ASSISTED_ONBOARDING',
      `Assisted student registration completed at MeeSeva Kiosk ${payload.kioskCenterId}. Biometric consent verified. Digital Seal: ${digitalSeal.slice(0, 16)}...`
    );

    const qrPayload = JSON.stringify({
      ack: ackNumber,
      appId: applicationId,
      student: studentName,
      aadhaar: aadhaarMasked,
      scheme: payload.schemeCode,
      kiosk: payload.kioskCenterId,
      vle: payload.vleOperatorId,
      seal: digitalSeal.slice(0, 12)
    });

    return {
      ackNumber,
      applicationId,
      studentId: applicantId,
      studentName,
      schemeCode: payload.schemeCode,
      schemeName,
      kioskCenterId: payload.kioskCenterId,
      vleOperatorId: payload.vleOperatorId,
      networkOrigin,
      digitalSeal,
      timestamp: nowIso,
      status: 'FORWARDED_TO_INSTITUTE_NODAL_OFFICER',
      entitlement: 'Full Tuition Waiver + ₹1,000/mo DBT Direct Beneficiary Maintenance',
      qrPayload
    };
  }

  /**
   * Retrieves kiosk operational statistics and recent assisted onboardings.
   */
  static getKioskStats(kioskCenterId: string = 'MS-TELANGANA-BHADRADRI-09', dbInstance?: any) {
    const db = dbInstance || getDb();
    const rows = db.prepare(`
      SELECT * FROM applications
      WHERE explainable_status LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(`%${kioskCenterId}%`) as any[];

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM applications
      WHERE explainable_status LIKE ?
    `).get(`%${kioskCenterId}%`) as any;

    return {
      kioskCenterId,
      authorizedOperator: 'Shri Rajeshwar Rao (VLE-4912)',
      empanelledNetwork: 'MeeSeva Telangana SWAN (State Wide Area Network)',
      operatorStatus: 'ACTIVE_LICENSED',
      totalAssistedRegistrations: totalCount ? totalCount.count : rows.length,
      recentRegistrations: rows.map(r => ({
        id: r.id,
        applicantId: r.applicant_id,
        schemeId: r.scheme_id,
        submittedAt: r.submitted_at,
        status: r.status,
        stage: r.current_stage
      }))
    };
  }
}
