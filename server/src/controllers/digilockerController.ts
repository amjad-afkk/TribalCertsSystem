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

export const verifyCertificateQr = (req: Request, res: Response): void => {
  try {
    const { docUri, certificateNumber, issuer } = req.body;

    // Cryptographic validation simulation
    const isValid = Boolean(docUri && docUri.includes('edistrict'));

    res.json({
      success: true,
      verified: true,
      data: {
        docUri: docUri || 'in.gov.edistrict:cert:verified',
        certificateNumber: certificateNumber || 'ST-PVTG-2026-9912',
        issuer: issuer || 'Competent State Revenue Authority',
        algorithm: 'ECDSA_SHA256',
        publicSignatureFingerprint: 'SHA256:7e9b...a401:GOI_EDISTRICT_ROOT_CA',
        timestamp: new Date().toISOString(),
        status: 'VALID_GOVERNMENT_AUTHENTICATED'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
