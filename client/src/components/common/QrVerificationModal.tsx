import React, { useState } from 'react';
import { api } from '../../services/api';
import { Search, CheckCircle2, AlertTriangle, X, RefreshCw, Shield } from 'lucide-react';

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  docType?: string;
  docUri?: string;
  certificateNumber?: string;
  issuer?: string;
  applicantName?: string;
  applicantId?: string;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  docType,
  certificateNumber: initialCertNum = '',
  issuer: initialIssuer = '',
  applicantName,
  applicantId
}) => {
  const [certNumber, setCertNumber] = useState(initialCertNum);
  const [searching, setSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setVerificationResult(null);
      setHasSearched(false);
      setCertNumber(initialCertNum);
    }
  }, [isOpen, initialCertNum]);

  const handleVerify = async () => {
    if (!certNumber.trim() && !applicantId) return;
    setSearching(true);
    setVerificationResult(null);

    try {
      const resp = await api.verifyCertificateRegistry({
        certificateNumber: certNumber.trim(),
        docType,
        issuer: initialIssuer,
        applicantName,
        applicantId
      });
      setTimeout(() => {
        setVerificationResult(resp);
        setSearching(false);
        setHasSearched(true);
      }, 800);
    } catch (err) {
      console.error('Certificate verification error:', err);
      setSearching(false);
      setHasSearched(true);
    }
  };

  // Auto-verify if certificate number is pre-filled
  React.useEffect(() => {
    if (isOpen && initialCertNum && !hasSearched) {
      handleVerify();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isVerified = verificationResult?.verified === true;
  const hasNameMismatch = verificationResult?.data?.nameMatchStatus === 'MISMATCH_FLAGGED';

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, padding: '1rem', backdropFilter: 'blur(3px)'
    }}>
      <div className="gov-card" style={{
        maxWidth: '580px', width: '100%',
        borderTop: `5px solid ${isVerified && !hasNameMismatch ? '#1B7837' : hasNameMismatch ? '#D97706' : '#1A4D8F'}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: '#1A4D8F' }} />
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0 }}>
              e-District Certificate Registry Verification
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Document info */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          <span style={{ color: '#718096' }}>Document: </span>
          <strong style={{ color: '#0A2540' }}>{documentTitle}</strong>
        </div>

        {/* Certificate number input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.35rem' }}>
            Certificate / Registration Number
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="e.g. ST-PVTG/2022/DND/4011"
              style={{
                flex: 1, padding: '0.6rem 0.75rem', borderRadius: '6px',
                border: '1px solid #CBD5E0', fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleVerify}
              disabled={searching || (!certNumber.trim() && !applicantId)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              {searching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.35rem' }}>
            Looks up the certificate number against the state e-District portal registry via NSDG Gateway.
          </p>
        </div>

        {/* Searching animation */}
        {searching && (
          <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
            <div style={{ color: '#4A5568', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className="animate-spin" />
              Querying State e-District Registry via National Single Digital Gateway (NSDG)...
            </div>
          </div>
        )}

        {/* Verification result */}
        {!searching && hasSearched && verificationResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Status banner */}
            {isVerified ? (
              <div style={{
                backgroundColor: hasNameMismatch ? '#FFFBEB' : '#EAF7EE',
                border: `1px solid ${hasNameMismatch ? '#FCD34D' : '#A3E0B5'}`,
                padding: '1rem', borderRadius: '6px',
                color: hasNameMismatch ? '#92400E' : '#176529'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {hasNameMismatch ? (
                    <><AlertTriangle size={18} /> Certificate Found — Name Mismatch Detected</>
                  ) : (
                    <><CheckCircle2 size={18} /> Certificate Verified — Digital Signature Valid</>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  {hasNameMismatch
                    ? verificationResult.data.nameWarning
                    : 'Certificate record found in state e-District registry. PKI digital signature chain validated against NIC Root CA.'}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FDF0ED', border: '1px solid #F7B8B8', padding: '1rem', borderRadius: '6px', color: '#A61C1C' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={18} /> Certificate Not Found in Registry
                </div>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  The certificate number was not found in any connected state e-District registry. Manual verification by nodal officer is recommended.
                </div>
              </div>
            )}

            {/* Verification details */}
            <div style={{
              backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '6px',
              border: '1px solid #E2E8F0', fontSize: '0.8125rem',
              display: 'flex', flexDirection: 'column', gap: '0.4rem'
            }}>
              {verificationResult.registrySource && (
                <div>
                  <span style={{ color: '#718096' }}>Registry Source:</span>
                  <div style={{ fontWeight: 600, color: '#1A4D8F' }}>{verificationResult.registrySource}</div>
                </div>
              )}
              {verificationResult.data?.issuer && (
                <div>
                  <span style={{ color: '#718096' }}>Issuing Authority:</span>
                  <div style={{ fontWeight: 600 }}>{verificationResult.data.issuer}</div>
                </div>
              )}
              {verificationResult.data?.issueDate && (
                <div>
                  <span style={{ color: '#718096' }}>Issue Date:</span>
                  <div style={{ fontWeight: 600 }}>{verificationResult.data.issueDate}</div>
                </div>
              )}
              {verificationResult.data?.applicantNameOnCert && (
                <div>
                  <span style={{ color: '#718096' }}>Name on Certificate:</span>
                  <div style={{ fontWeight: 600 }}>{verificationResult.data.applicantNameOnCert}</div>
                </div>
              )}
              {(verificationResult.data?.verificationDetails?.algorithm || verificationResult.data?.algorithm) && (
                <div>
                  <span style={{ color: '#718096' }}>PKI Algorithm:</span>
                  <div style={{ fontFamily: 'monospace', color: '#1A4D8F' }}>
                    {verificationResult.data?.verificationDetails?.algorithm || verificationResult.data?.algorithm} • NIC Root CA
                  </div>
                </div>
              )}
              {(verificationResult.data?.verificationDetails?.nsdgTransactionId || verificationResult.data?.nsdgTransactionId) && (
                <div>
                  <span style={{ color: '#718096' }}>NSDG Transaction ID:</span>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {verificationResult.data?.verificationDetails?.nsdgTransactionId || verificationResult.data?.nsdgTransactionId}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const QrVerificationModal = CertificateVerificationModal;
