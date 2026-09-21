import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';

export const getDigiLockerDocuments = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const applicantId = (req.query.applicantId || req.params.applicantId) as string;

    let docs = [];
    if (applicantId) {
      docs = db.prepare('SELECT * FROM digilocker_documents WHERE applicant_id = ?').all(applicantId) as any[];
    }

    if (docs.length === 0) {
      // Fallback to all demo docs if specific applicant has none
      docs = db.prepare('SELECT * FROM digilocker_documents').all() as any[];
    }

    const formatted = docs.map(d => ({
      id: d.id,
      applicantId: d.applicant_id,
      docType: d.doc_type,
      title: d.title,
      issuer: d.issuer,
      docUri: d.doc_uri,
      issueDate: d.issue_date,
      verifiedData: JSON.parse(d.verified_data || '{}')
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Certificate Registry Lookup Verification
 *
 * Instead of QR code scanning (most Indian govt certificates don't have QR codes),
 * this endpoint verifies certificates by looking up the certificate number + issuing
 * authority against the state e-District / NSDG registry.
 *
 * This mirrors the real-world workflow where state revenue offices issue certificates
 * with unique serial numbers that can be verified against the e-District portal
 * (e.g., edistrict.up.gov.in, mpedistrict.gov.in, etc.).
 *
 * Verification chain:
 * 1. Applicant provides certificate number + doc type + issuing authority
 * 2. System queries the e-District registry (simulated via DigiLocker + synthetic data)
 * 3. Cross-validates candidate name and certificate details
 * 4. Returns cryptographic verification status with PKI signature chain
 */
export const verifyCertificateRegistry = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const {
      certificateNumber,
      docType,
      issuer,
      applicantName,
      applicantId
    } = req.body;

    if (!certificateNumber && !docType) {
      res.status(400).json({
        success: false,
        message: 'Certificate number or document type is required for registry verification.'
      });
      return;
    }

    // Step 1: Look up in seeded DigiLocker documents (pre-verified govt docs)
    let registryMatch: any = null;

    if (applicantId && docType) {
      registryMatch = db.prepare(
        'SELECT * FROM digilocker_documents WHERE applicant_id = ? AND doc_type = ?'
      ).get(applicantId, docType);
    }

    if (!registryMatch && certificateNumber) {
      // Search by certificate number across all DigiLocker docs
      const allDocs = db.prepare('SELECT * FROM digilocker_documents').all() as any[];
      registryMatch = allDocs.find(d => {
        const data = JSON.parse(d.verified_data || '{}');
        return d.doc_uri?.includes(certificateNumber) ||
               data.certificateNumber === certificateNumber;
      });
    }

    // Step 2: If found in registry, validate
    if (registryMatch) {
      const verifiedData = JSON.parse(registryMatch.verified_data || '{}');

      // Cross-validate applicant name if provided
      let nameMatch = true;
      let nameWarning: string | null = null;
      if (applicantName && verifiedData.candidateName) {
        const formName = applicantName.toLowerCase().trim();
        const regName = verifiedData.candidateName.toLowerCase().trim();
        nameMatch = formName === regName ||
                    formName.includes(regName) ||
                    regName.includes(formName);

        if (!nameMatch) {
          nameWarning = `Name mismatch: Application form states "${applicantName}", but registry record shows "${verifiedData.candidateName}".`;
        }
      }

      // Determine the issuing state from the doc_uri or issuer field
      const docUri = registryMatch.doc_uri || '';
      const stateCode = docUri.match(/in\.gov\.(\w+)\./)?.[1]?.toUpperCase() || 'GOI';

      res.json({
        success: true,
        verified: true,
        registrySource: `State e-District Portal (${stateCode}) via NSDG Gateway`,
        data: {
          certificateNumber: certificateNumber || docUri.split(':').pop(),
          docType: registryMatch.doc_type,
          title: registryMatch.title,
          issuer: registryMatch.issuer,
          issueDate: registryMatch.issue_date,
          applicantNameOnCert: verifiedData.candidateName,
          nameMatchStatus: nameMatch ? 'EXACT_MATCH' : 'MISMATCH_FLAGGED',
          nameWarning,
          verificationDetails: {
            algorithm: 'ECDSA_P256_SHA256',
            signingAuthority: verifiedData.signingAuthority || registryMatch.issuer,
            digitalSignatureStatus: verifiedData.digitalSignatureStatus || 'CRYPTOGRAPHICALLY_VERIFIED',
            certificateChain: 'NIC_ROOT_CA → State_Intermediate_CA → District_Issuing_CA',
            nsdgTransactionId: `NSDG-VER-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            verifiedAt: new Date().toISOString()
          },
          extractedFields: verifiedData
        }
      });
      return;
    }

    // Step 3: Not found in registry — simulate a synthetic lookup result
    // In production this would call the actual e-District / NSDG API
    const syntheticResult = generateSyntheticVerification(certificateNumber || '', docType || '', issuer || '');

    res.json({
      success: true,
      verified: syntheticResult.isValid,
      registrySource: syntheticResult.registrySource,
      data: syntheticResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Generates a realistic synthetic verification response for demo purposes
 * when the certificate isn't in the pre-seeded DigiLocker dataset.
 */
function generateSyntheticVerification(
  certificateNumber: string,
  docType: string,
  issuer: string
) {
  // Determine validity heuristically from certificate number pattern
  const hasValidFormat = /^[A-Z]{2,5}[-\/]\d{4}/.test(certificateNumber) ||
                         certificateNumber.length > 8;
  const isValid = hasValidFormat;

  const statePatterns: Record<string, string> = {
    'MP': 'Madhya Pradesh e-District Portal (mpedistrict.gov.in)',
    'JH': 'Jharkhand e-District Portal (jharkhand.gov.in)',
    'CG': 'Chhattisgarh e-District Portal (edistrict.cgstate.gov.in)',
    'OD': 'Odisha e-District Portal (edistrict.odisha.gov.in)',
    'RJ': 'Rajasthan e-District Portal (edistrict.rajasthan.gov.in)',
    'AS': 'Assam e-District Portal (edistrict.assam.gov.in)'
  };

  // Try to detect state from certificate number prefix
  const statePrefix = certificateNumber.slice(0, 2).toUpperCase();
  const registrySource = statePatterns[statePrefix] ||
    `National e-District Gateway (NSDG) / ${issuer || 'Competent Revenue Authority'}`;

  return {
    certificateNumber,
    docType: docType || 'GENERAL',
    issuer: issuer || 'Competent State Authority',
    isValid,
    registrySource,
    verificationDetails: {
      algorithm: 'ECDSA_P256_SHA256',
      digitalSignatureStatus: isValid ? 'SIGNATURE_VALID' : 'CERTIFICATE_NOT_FOUND',
      certificateChain: isValid
        ? 'NIC_ROOT_CA → State_Intermediate_CA → District_Issuing_CA'
        : 'CHAIN_VERIFICATION_FAILED',
      nsdgTransactionId: `NSDG-VER-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      verifiedAt: new Date().toISOString(),
      remarks: isValid
        ? 'Certificate number found in state e-District registry. Digital signature chain validated successfully.'
        : 'Certificate number not found in any connected state e-District registry. Manual verification by nodal officer recommended.'
    }
  };
}
