import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck, CheckCircle2, X, DownloadCloud, Check
} from 'lucide-react';

interface DigiLockerDoc {
  id: string;
  applicantId: string;
  docType: string;
  title: string;
  issuer: string;
  docUri: string;
  issueDate: string;
  verifiedData: any;
}

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string;
  onImportDocument: (doc: {
    docType: string;
    fileName: string;
    extractedData: any;
    docUri: string;
  }) => void;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({
  isOpen,
  onClose,
  applicantId,
  onImportDocument
}) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DigiLockerDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const resp = await api.getDigiLockerDocuments(applicantId);
        if (resp.success) {
          setDocuments(resp.data);
          if (resp.data.length > 0) {
            setSelectedDocId(resp.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load DigiLocker documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [isOpen, applicantId]);

  if (!isOpen) return null;

  const handleImport = () => {
    const doc = documents.find(d => d.id === selectedDocId);
    if (!doc) return;

    setImporting(true);
    setTimeout(() => {
      onImportDocument({
        docType: doc.docType,
        fileName: `${doc.docType.toLowerCase()}_digilocker_verified.pdf`,
        extractedData: doc.verifiedData,
        docUri: doc.docUri
      });
      setImporting(false);
      onClose();
    }, 600);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem',
      backdropFilter: 'blur(3px)'
    }}>
      <div className="gov-card" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderTop: '5px solid #0056B3',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* DigiLocker Official Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#0056B3',
              color: '#FFFFFF',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.05em'
            }}>
              DigiLocker
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#4A5568', fontWeight: 600 }}>
                National Digital Document Repository • MeitY
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#0A2540', fontWeight: 700 }}>
                Direct Certificate Fetch & Verification
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Consent Notification Box */}
        <div style={{ backgroundColor: '#EBF3FC', border: '1px solid #BCD4F0', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8125rem', color: '#1A4D8F', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={16} /> Aadhaar-Linked National e-District Vault
          </div>
          <div>
            The Ministry of Tribal Affairs (MoTA) is authorized to fetch issued digital caste and income certificates directly from state digital repositories without requiring manual scanning or notarization.
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#718096' }}>
            Connecting to DigiLocker Partner Vault...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.7fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Document List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
                Issued Digital Certificates
              </span>
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocId(doc.id)}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: selectedDocId === doc.id ? '2px solid #0056B3' : '1px solid #E2E8F0',
                    backgroundColor: selectedDocId === doc.id ? '#F0F7FF' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0A2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{doc.title}</span>
                    {selectedDocId === doc.id && <Check size={14} style={{ color: '#0056B3' }} />}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#718096' }}>Issued: {doc.issueDate}</span>
                </button>
              ))}
            </div>

            {/* Document Details & Cryptographic Seal Preview */}
            {selectedDoc && (
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.35rem' }}>
                  Cryptographic Verification Seal
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155' }}>
                  <div>
                    <span style={{ color: '#718096' }}>Issuer Authority:</span>
                    <div style={{ fontWeight: 600 }}>{selectedDoc.issuer}</div>
                  </div>

                  <div>
                    <span style={{ color: '#718096' }}>DigiLocker Doc URI:</span>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0056B3', wordBreak: 'break-all' }}>
                      {selectedDoc.docUri}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#718096' }}>Digital Signature Status:</span>
                    <div style={{ color: '#176529', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> {selectedDoc.verifiedData.digitalSignatureStatus || 'CRYPTOGRAPHICALLY_VERIFIED'}
                    </div>
                  </div>

                  {selectedDoc.verifiedData.annualIncome && (
                    <div>
                      <span style={{ color: '#718096' }}>Certified Annual Income:</span>
                      <div style={{ fontWeight: 700, color: '#1B7837' }}>
                        ₹{Number(selectedDoc.verifiedData.annualIncome).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {selectedDoc.verifiedData.tribeName && (
                    <div>
                      <span style={{ color: '#718096' }}>Certified Tribal Community:</span>
                      <div style={{ fontWeight: 700 }}>
                        {selectedDoc.verifiedData.tribeName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedDoc || importing}
            className="btn btn-primary"
            style={{ backgroundColor: '#0056B3', borderColor: '#0056B3' }}
          >
            {importing ? (
              'Importing DigiLocker Data...'
            ) : (
              <>
                <DownloadCloud size={16} /> Import Pre-Verified Certificate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
