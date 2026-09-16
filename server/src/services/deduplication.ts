import { DatabaseSync } from 'node:sqlite';

export interface DeduplicationCheckResult {
  isBlocked: boolean;
  hasWarnings: boolean;
  blockReason: string | null;
  warnings: string[];
  existingApplications: {
    applicationId: string;
    schemeName: string;
    schemeCode: string;
    academicYear: string;
    status: string;
  }[];
  conflictType: 'NONE' | 'MUTUALLY_EXCLUSIVE_SCHEME' | 'DUPLICATE_BANK_ACCOUNT' | 'DUPLICATE_ACTIVE_CLAIM';
}

// Mutually exclusive scheme pairs (concurrent funding prohibited under MoTA guidelines)
const MUTUALLY_EXCLUSIVE_PAIRS: [string, string][] = [
  ['BPVGK', 'BVOBC'], // Pre-Matric vs Post-Matric
  ['BVOBC', 'A023B'], // Post-Matric vs Top Class Education
  ['ARG45', 'AZKMI'], // National Fellowship vs National Overseas Scholarship
  ['A023B', 'ARG45']  // Top Class vs National Fellowship
];

export class DeduplicationEngine {
  /**
   * Evaluates if a new application creates cross-scheme double-dipping or bank fraud.
   */
  static checkApplicationConflict(
    db: DatabaseSync,
    applicantId: string,
    targetSchemeCode: string,
    academicYear: string,
    bankAccountHash: string
  ): DeduplicationCheckResult {
    const warnings: string[] = [];
    let isBlocked = false;
    let blockReason: string | null = null;
    let conflictType: DeduplicationCheckResult['conflictType'] = 'NONE';

    // 1. Fetch all existing active applications for this applicant across any scheme
    const existingAppsStmt = db.prepare(`
      SELECT a.id, a.scheme_id, s.code as scheme_code, s.name as scheme_name,
             a.academic_year, a.status
      FROM applications a
      JOIN schemes s ON a.scheme_id = s.id
      WHERE a.applicant_id = ?
        AND a.academic_year = ?
        AND a.status NOT IN ('REJECTED', 'DRAFT')
    `);

    const existingApps = existingAppsStmt.all(applicantId, academicYear) as any[];

    // Check for exact same scheme duplicate
    const sameSchemeApp = existingApps.find(app => app.scheme_code === targetSchemeCode);
    if (sameSchemeApp) {
      isBlocked = true;
      conflictType = 'DUPLICATE_ACTIVE_CLAIM';
      blockReason = `Active application (${sameSchemeApp.id}) already exists for ${sameSchemeApp.scheme_name} in academic year ${academicYear} with status ${sameSchemeApp.status}. Duplicate submissions are prohibited.`;
    }

    // Check for mutually exclusive schemes
    for (const app of existingApps) {
      const isExclusive = MUTUALLY_EXCLUSIVE_PAIRS.some(
        ([c1, c2]) => (c1 === targetSchemeCode && c2 === app.scheme_code) ||
                      (c2 === targetSchemeCode && c1 === app.scheme_code)
      );

      if (isExclusive) {
        isBlocked = true;
        conflictType = 'MUTUALLY_EXCLUSIVE_SCHEME';
        blockReason = `One Nation One Scholarship ID Conflict: Candidate already holds active scholarship under "${app.scheme_name}" (${app.scheme_code}). Under MoTA guidelines, concurrent benefits with "${targetSchemeCode}" are strictly mutually exclusive.`;
        break;
      }
    }

    // 2. Check for Duplicate Bank Account reused across different applicants
    const bankReuseStmt = db.prepare(`
      SELECT id, name, aadhaar_masked
      FROM applicants
      WHERE bank_account_hash = ?
        AND id != ?
    `);

    const bankConflicts = bankReuseStmt.all(bankAccountHash, applicantId) as any[];
    if (bankConflicts.length > 0) {
      conflictType = 'DUPLICATE_BANK_ACCOUNT';
      warnings.push(
        `High-Risk Fraud Signal: The bank account submitted is already registered to another applicant (${bankConflicts[0].name}, Aadhaar ${bankConflicts[0].aadhaar_masked}). Cross-applicant bank reuse flagged for manual nodal scrutiny.`
      );
    }

    return {
      isBlocked,
      hasWarnings: warnings.length > 0,
      blockReason,
      warnings,
      existingApplications: existingApps.map(a => ({
        applicationId: a.id,
        schemeName: a.scheme_name,
        schemeCode: a.scheme_code,
        academicYear: a.academic_year,
        status: a.status
      })),
      conflictType
    };
  }
}
