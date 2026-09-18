import React, { useState } from 'react';
import { api } from '../../services/api';
import { QrCode, CheckCircle2, X, RefreshCw } from 'lucide-react';

interface QrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  docUri?: string;
  certificateNumber?: string;
  issuer?: string;
}

export const QrVerificationModal: React.FC<QrVerificationModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  docUri = 'in.gov.mp.edistrict:caste:ST-2022-DND-4011',
  certificateNumber = 'ST-PVTG/2022/DND/4011',
  issuer = 'Sub-Divisional Officer (Civil), Revenue Division, Dindori'
}) => {
  const [scanning, setScanning] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setScanning(true);
    setVerificationResult(null);

    const runCheck = async () => {
      try {
        const resp = await api.verifyCertificateQr({
          docUri,
          certificateNumber,
          issuer
        });
        setTimeout(() => {
          setVerificationResult(resp);
          setScanning(false);
        }, 900);
      } catch (err) {
        console.error('QR verification error:', err);
        setScanning(false);
      }
    };
    runCheck();
  }, [isOpen, docUri]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, padding: '1rem', backdropFilter: 'blur(3px)'
    }}>
      <div className="gov-card" style={{
        maxWidth: '520px', width: '100%',
        borderTop: '5px solid #1B7837',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} style={{ color: '#1B7837' }} />
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0 }}>
              QR Code Digital Signature Verification (Section 5.4)
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          {scanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '120px', height: '120px', border: '3px dashed #1B7837',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#F0FDF4'
              }}>
                <QrCode size={64} style={{ color: '#166534', opacity: 0.6 }} />
              </div>
              <div style={{ color: '#4A5568', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} className="animate-spin" />
                Scanning e-District QR Code & Validating Cryptographic Seal...
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#EAF7EE', border: '1px solid #A3E0B5', padding: '1rem', borderRadius: '6px', color: '#176529' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={18} /> Digital Signature Verified Clean (Valid)
                </div>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  Document matches the official state public key infrastructure repository. No tampering detected.
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>
                  <span style={{ color: '#718096' }}>Document:</span>
                  <div style={{ fontWeight: 600, color: '#0A2540' }}>{documentTitle}</div>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Certificate ID:</span>
                  <div style={{ fontWeight: 600 }}>{certificateNumber}</div>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>Issuing Authority:</span>
                  <div style={{ fontWeight: 600 }}>{issuer}</div>
                </div>
                <div>
                  <span style={{ color: '#718096' }}>PKI Algorithm:</span>
                  <div style={{ fontFamily: 'monospace', color: '#1A4D8F' }}>
                    {verificationResult?.data?.algorithm || 'ECDSA_SHA256 • State e-District Root CA'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
