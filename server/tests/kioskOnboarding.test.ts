import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/db/connection.js';
import { runSeed } from '../src/db/seed.js';
import { KioskService } from '../src/services/kioskService.js';
import { AUTHORIZED_KIOSK_ORIGINS, verifyKioskCorsAndLicense } from '../src/middleware/kioskSecurity.js';

describe('MeeSeva / CSC Assisted Kiosk Onboarding & Internal CORS Defense', () => {
  const db = getDb(true);
  runSeed(db);

  test('should reject onboarding from unauthorized public origin with 403 CORS Policy Violation', () => {
    let statusCode: number | null = null;
    let responseBody: any = null;

    const mockReq: any = {
      headers: {
        'origin': 'http://localhost:5173',
        'x-kiosk-network': 'PUBLIC_INTERNET'
      }
    };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return {
          json(body: any) {
            responseBody = body;
          }
        };
      }
    };
    const mockNext = () => {
      assert.fail('next() should not be called for unauthorized public origin');
    };

    verifyKioskCorsAndLicense(mockReq, mockRes, mockNext);

    assert.strictEqual(statusCode, 403);
    assert.strictEqual(responseBody?.error, 'CORS_POLICY_VIOLATION');
    assert.strictEqual(responseBody?.networkState, 'PUBLIC_UNRESTRICTED_INTERNET');
    assert.ok(responseBody?.message.includes('MeeSeva/CSC Government Intranet whitelist'));
  });

  test('should reject onboarding when Kiosk License Key is missing or invalid', () => {
    let statusCode: number | null = null;
    let responseBody: any = null;

    const mockReq: any = {
      headers: {
        'origin': 'https://kiosk.meeseva.gov.in',
        'x-simulated-origin': 'https://kiosk.meeseva.gov.in',
        'x-kiosk-network': 'SWAN_AUTHORIZED_INTRANET',
        'x-kiosk-license-key': 'INVALID-KEY-999'
      }
    };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return {
          json(body: any) {
            responseBody = body;
          }
        };
      }
    };
    const mockNext = () => {
      assert.fail('next() should not be called with invalid license');
    };

    verifyKioskCorsAndLicense(mockReq, mockRes, mockNext);

    assert.strictEqual(statusCode, 401);
    assert.strictEqual(responseBody?.error, 'INVALID_KIOSK_LICENSE');
  });

  test('should pass security gateway when on authorized SWAN origin and valid license', () => {
    let nextCalled = false;

    const mockReq: any = {
      headers: {
        'origin': 'https://kiosk.meeseva.gov.in',
        'x-simulated-origin': 'https://kiosk.meeseva.gov.in',
        'x-kiosk-network': 'SWAN_AUTHORIZED_INTRANET',
        'x-kiosk-license-key': 'VLE-MEESEVA-2026-TRIBAL'
      }
    };
    const mockRes: any = {
      status() { return { json() {} }; }
    };
    const mockNext = () => {
      nextCalled = true;
    };

    verifyKioskCorsAndLicense(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCalled, true, 'Gateway must permit authorized MeeSeva SWAN kiosk');
  });

  test('should successfully onboard tribal student and generate official acknowledgement receipt & audit trail', () => {
    const studentData = {
      studentName: 'Kailash Maravi',
      aadhaarMasked: 'XXXX-XXXX-9944',
      category: 'PVTG' as const,
      gender: 'MALE' as const,
      annualIncome: 95000,
      state: 'Madhya Pradesh',
      district: 'Dindori',
      schemeCode: 'BPVGK', // Pre-Matric ST
      instituteName: 'Government Model Tribal Higher Secondary School',
      kioskCenterId: 'MS-DINDORI-04',
      vleOperatorId: 'VLE-MP-4912',
      biometricVerified: true
    };

    const receipt = KioskService.onboardStudent(studentData, 'https://kiosk.meeseva.gov.in', db);

    assert.ok(receipt);
    assert.ok(receipt.ackNumber.startsWith('ACK-MS-'));
    assert.strictEqual(receipt.studentName, 'Kailash Maravi');
    assert.strictEqual(receipt.kioskCenterId, 'MS-DINDORI-04');
    assert.strictEqual(receipt.vleOperatorId, 'VLE-MP-4912');
    assert.strictEqual(receipt.status, 'FORWARDED_TO_INSTITUTE_NODAL_OFFICER');
    assert.ok(receipt.digitalSeal.length > 20);

    // Verify DB insertion in applications
    const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(receipt.applicationId) as any;
    assert.ok(appRow);
    assert.strictEqual(appRow.status, 'SUBMITTED');
    assert.strictEqual(appRow.current_stage, 'INSTITUTE_VERIFICATION');

    const parsedForm = JSON.parse(appRow.form_data);
    assert.strictEqual(parsedForm.onboardedVia, 'MEESEVA_ASSISTED_KIOSK');
    assert.strictEqual(parsedForm.kioskCenterId, 'MS-DINDORI-04');
    assert.strictEqual(parsedForm.vleOperatorId, 'VLE-MP-4912');

    // Verify Audit log entry
    const audit = db.prepare('SELECT * FROM audit_logs WHERE entity_id = ?').get(receipt.applicationId) as any;
    assert.ok(audit);
    assert.strictEqual(audit.action, 'MEESEVA_ASSISTED_ONBOARDING');
    assert.strictEqual(audit.actor, 'VLE-MP-4912');

    // Verify Kiosk stats reflect new registration
    const stats = KioskService.getKioskStats('MS-DINDORI-04', db);
    assert.ok(stats.totalAssistedRegistrations >= 1);
  });
});
