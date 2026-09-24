import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Scheme, Applicant } from '../../types';
import { X, CheckCircle, Sparkles, Send, ShieldAlert, DownloadCloud, Upload, Trash2, FileText, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { DigiLockerModal } from './DigiLockerModal';
import { AadhaarMasker } from '../common/AadhaarMasker';

interface DynamicApplicationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultSchemeCode?: string;
  applicant: Applicant;
}

export const DynamicApplicationForm: React.FC<DynamicApplicationFormProps> = ({
  onClose,
  onSuccess,
  defaultSchemeCode,
  applicant
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Array<{
    docType: string;
    fileName: string;
    fileUrl?: string;
    status: string;
    ocrExtracted?: any;
    extracted?: any;
    discrepancyNote?: string | null;
  }>>([]);

  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isAadhaarMaskerOpen, setIsAadhaarMaskerOpen] = useState(false);

  const handleMaskedAadhaarReady = (maskedFile: { dataUrl: string; hash: string; maskedAadhaar: string }) => {
    setUploadedDocs(prev => [
      ...prev.filter(d => d.docType !== 'AADHAAR'),
      {
        docType: 'AADHAAR',
        fileName: `masked_aadhaar_${maskedFile.maskedAadhaar}.jpg`,
        fileUrl: maskedFile.dataUrl,
        status: 'DPDP_MASKED_VERIFIED',
        ocrExtracted: {
          maskedAadhaar: maskedFile.maskedAadhaar,
          sha256Proof: maskedFile.hash,
          dpdpCompliant: true,
          zeroBiometricRetention: true
        },
        extracted: {
          maskedAadhaar: maskedFile.maskedAadhaar,
          sha256Proof: maskedFile.hash
        }
      }
    ]);
  };

  const handleImportDigiLockerDoc = (doc: {
    docType: string;
    fileName: string;
    extractedData: any;
    docUri: string;
  }) => {
    // Run cross-consistency check against application form parameters
    let hasDiscrepancy = false;
    let discrepancyNote: string | null = null;
    const claimedIncome = formData.claimedIncome !== undefined ? Number(formData.claimedIncome) : applicant.annualIncome;

    if (doc.extractedData?.annualIncome && claimedIncome) {
      if (Math.abs(doc.extractedData.annualIncome - claimedIncome) > 1000) {
        hasDiscrepancy = true;
        const exceedsCeiling = activeScheme?.incomeCeiling != null && doc.extractedData.annualIncome > activeScheme.incomeCeiling;
        discrepancyNote = exceedsCeiling
          ? `DigiLocker Income certificate states ₹${doc.extractedData.annualIncome.toLocaleString('en-IN')}, which exceeds statutory scheme ceiling of ₹${activeScheme?.incomeCeiling?.toLocaleString('en-IN')}, whereas form states ₹${claimedIncome.toLocaleString('en-IN')}.`
          : `Income mismatch: DigiLocker Certificate states ₹${doc.extractedData.annualIncome.toLocaleString('en-IN')}, but application claimed ₹${claimedIncome.toLocaleString('en-IN')}.`;
      }
    }

    setUploadedDocs(prev => [
      ...prev.filter(d => d.docType !== doc.docType),
      {
        docType: doc.docType,
        fileName: doc.fileName,
        fileUrl: doc.docUri,
        status: hasDiscrepancy ? 'DEFICIENCY_FLAGGED' : 'DIGILOCKER_VERIFIED',
        ocrExtracted: doc.extractedData,
        extracted: doc.extractedData,
        discrepancyNote
      }
    ]);
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      const res = await api.getSchemes();
      if (res.success) {
        setSchemes(res.data);
        if (defaultSchemeCode) {
          const matched = res.data.find((s: Scheme) => s.code === defaultSchemeCode);
          if (matched) setSelectedSchemeId(matched.id);
        } else if (res.data.length > 0) {
          setSelectedSchemeId(res.data[0].id);
        }
      }
    };
    fetchSchemes();
  }, [defaultSchemeCode]);

  const activeScheme = schemes.find(s => s.id === selectedSchemeId);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Process real document upload with Gemini Multimodal AI extraction
  const handleProcessDocument = async (
    docType: string,
    fileName: string,
    base64Data?: string,
    mimeType?: string,
    fileUrl?: string
  ) => {
    setUploadingDocType(docType);
    setOcrResult(null);
    try {
      const currentClaimedIncome = formData.claimedIncome !== undefined ? Number(formData.claimedIncome) : applicant.annualIncome;
      const resp = await api.extractAndVerifyDocument({
        docType,
        fileName,
        base64Data,
        mimeType,
        formData: {
          candidateName: applicant.name,
          annualIncome: currentClaimedIncome,
          incomeCeiling: activeScheme?.incomeCeiling,
          courseLevel: applicant.courseLevel,
          instituteName: applicant.instituteName
        }
      });

      if (resp.success) {
        setOcrResult(resp);
        setUploadedDocs(prev => [
          ...prev.filter(d => d.docType !== docType),
          {
            docType,
            fileName,
            fileUrl: fileUrl || '/uploads/sample.pdf',
            status: resp.verification.hasDiscrepancy ? 'DEFICIENCY_FLAGGED' : 'OCR_VERIFIED',
            ocrExtracted: resp.extracted,
            extracted: resp.extracted,
            discrepancyNote: resp.verification.explainableDeficiencyReason
          }
        ]);
      }
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
    } finally {
      setUploadingDocType(null);
    }
  };

  // Real File Upload handler
  const handleRealFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      handleProcessDocument(docType, file.name, base64Data, file.type || 'application/pdf', dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting works
    e.target.value = '';
  };

  const handleRemoveDoc = (docType: string) => {
    setUploadedDocs(prev => prev.filter(d => d.docType !== docType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const resp = await api.submitApplication({
        applicantId: applicant.id,
        schemeId: selectedSchemeId,
        academicYear: '2026-2027',
        formData: {
          institute: applicant.instituteName,
          claimedIncome: applicant.annualIncome,
          academicPercentage: applicant.academicPercentage,
          ...formData
        },
        documents: uploadedDocs
      });

      if (resp.success) {
        onSuccess();
      } else if (resp.errorType === 'DEDUPLICATION_BLOCK') {
        setErrorMessage(resp.message);
      } else {
        setErrorMessage(resp.message || 'Submission failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="gov-card" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        padding: '1.75rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#1A4D8F', fontWeight: 600 }}>
              Ministry of Tribal Affairs • Integrated Form Engine
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#0A2540' }}>Dynamic Scheme Application</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#FDF0ED',
            border: '1px solid #F7B8B8',
            borderRadius: '4px',
            padding: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <ShieldAlert size={20} style={{ color: '#A61C1C', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.8125rem', color: '#A61C1C' }}>One Nation One ID Validation Block:</strong>
              <p style={{ fontSize: '0.75rem', color: '#742A2A', marginTop: '0.2rem', lineHeight: 1.4 }}>
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Scheme Selector */}
          <div className="form-group">
            <label className="form-label">Select MoTA Scholarship / Fellowship Scheme</label>
            <select
              className="form-select"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              required
            >
              {schemes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.level})
                </option>
              ))}
            </select>
          </div>

          {activeScheme && (
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.875rem', borderRadius: '4px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568' }}>
                <span>Income Ceiling: <strong>{activeScheme.incomeCeiling ? `≤ ₹${activeScheme.incomeCeiling.toLocaleString('en-IN')}` : 'No Ceiling'}</strong></span>
                <span>Selection: <strong>{activeScheme.selectionMethod}</strong></span>
                <span>Disbursement: <strong>{activeScheme.disbursementFrequency}</strong></span>
              </div>
            </div>
          )}

          {/* Dynamic Fields per Scheme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Applicant Name (as in Aadhaar)</label>
              <input type="text" className="form-input" value={applicant.name} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Current Institute / University</label>
              <input
                type="text"
                className="form-input"
                value={formData.institute !== undefined ? formData.institute : applicant.instituteName}
                onChange={(e) => handleFieldChange('institute', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Declared Annual Family Income (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.claimedIncome !== undefined ? formData.claimedIncome : applicant.annualIncome}
                onChange={(e) => handleFieldChange('claimedIncome', Number(e.target.value))}
                placeholder="e.g. 240000"
                required
              />
              <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                Must match the certified amount on your revenue income certificate.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Qualifying Academic Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={formData.academicPercentage !== undefined ? formData.academicPercentage : applicant.academicPercentage}
                onChange={(e) => handleFieldChange('academicPercentage', Number(e.target.value))}
                required
              />
            </div>
          </div>

          {activeScheme?.code === 'ARG45' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '0.875rem', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A2540' }}>
                NFST Fellowship Specific Fields
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">M.Phil / Ph.D Approved Research Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Indigenous Ethnomedicine and Preservation of Tribal Flora"
                  onChange={(e) => handleFieldChange('phdTopic', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Research Guide / Head of Department Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prof. Ananya Sen, Faculty of Tribal Studies"
                  onChange={(e) => handleFieldChange('guideName', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {activeScheme?.code === 'AZKMI' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '0.875rem', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A2540' }}>
                National Overseas Scholarship (NOS) Specific Fields
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Foreign University Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. University of Oxford"
                    onChange={(e) => handleFieldChange('foreignUniversity', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">QS World University Rank</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 3"
                    onChange={(e) => handleFieldChange('qsRank', Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scheme Document Checklist with Instant AI OCR & DigiLocker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ margin: 0 }}>
                  Required Document Verification (DigiLocker & AI OCR)
                </label>
                <div style={{ fontSize: '0.6875rem', color: '#718096' }}>
                  Fetch tamper-proof credentials directly from DigiLocker or scan with AI OCR
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsAadhaarMaskerOpen(prev => !prev)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: isAadhaarMaskerOpen ? '#1A4D8F' : '#F1F5F9',
                    color: isAadhaarMaskerOpen ? '#FFFFFF' : '#1A4D8F',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem'
                  }}
                >
                  <ShieldCheck size={13} />
                  {isAadhaarMaskerOpen ? 'Hide Masker' : 'Mask Aadhaar (DPDP 2023)'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDigiLockerOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: '#0F2A4A',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem'
                  }}
                >
                  <DownloadCloud size={13} />
                  Fetch from DigiLocker
                </button>
                <span style={{ fontSize: '0.6875rem', color: '#1A4D8F', fontWeight: 600 }}>
                  Gemini OCR Active
                </span>
              </div>
            </div>

            {/* In-Browser Aadhaar Redaction Tool */}
            {isAadhaarMaskerOpen && (
              <div style={{ marginBottom: '1rem' }}>
                <AadhaarMasker onMaskedFileReady={handleMaskedAadhaarReady} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeScheme?.documentChecklist.map((doc) => {
                const uploaded = uploadedDocs.find(d => d.docType === doc.docType);
                const isScanning = uploadingDocType === doc.docType;

                return (
                  <div key={doc.docType} style={{
                    padding: '0.75rem 0.875rem',
                    borderRadius: '6px',
                    backgroundColor: uploaded?.status === 'DEFICIENCY_FLAGGED' ? '#FFF5F5' : uploaded ? '#F0FDF4' : '#FFFFFF',
                    border: `1px solid ${uploaded?.status === 'DEFICIENCY_FLAGGED' ? '#FECACA' : uploaded ? '#BBF7D0' : '#E2E8F0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A2540', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileText size={14} style={{ color: '#1A4D8F' }} />
                          {doc.title} {doc.required && <span style={{ color: '#C82333' }}>*</span>}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.1rem' }}>
                          Code: {doc.docType} {uploaded && `• Attached: ${uploaded.fileName}`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {uploaded ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`badge ${uploaded.status === 'DEFICIENCY_FLAGGED' ? 'badge-rejected' : 'badge-approved'}`} style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {uploaded.status === 'DEFICIENCY_FLAGGED' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                              {uploaded.status === 'DEFICIENCY_FLAGGED' ? 'Deficiency Flagged' :
                               uploaded.status === 'DIGILOCKER_VERIFIED' ? 'DigiLocker Verified' :
                               uploaded.status === 'DPDP_MASKED_VERIFIED' ? 'DPDP Masked' : 'AI Verified'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.docType)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', color: '#A61C1C' }}
                              title="Remove document"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : isScanning ? (
                          <span style={{ fontSize: '0.75rem', color: '#1A4D8F', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <RefreshCw size={13} className="animate-spin" /> AI Extracting & Verifying...
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {/* Real File Upload Input */}
                            <label
                              className="btn btn-primary btn-sm"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.65rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                margin: 0
                              }}
                            >
                              <Upload size={12} />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => handleRealFileUpload(doc.docType, e)}
                                style={{ display: 'none' }}
                              />
                            </label>

                            {/* Quick Sample Selector for Convenience */}
                            <button
                              type="button"
                              onClick={() => handleProcessDocument(
                                doc.docType,
                                `${applicant.name.toLowerCase().split(' ')[0]}_${doc.docType.toLowerCase()}_sample.pdf`
                              )}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.6875rem', padding: '0.3rem 0.5rem', color: '#4A5568' }}
                              title="Use pre-verified sample for instant demo"
                            >
                              <Sparkles size={11} style={{ color: '#E06D14' }} /> Sample
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discrepancy Note Preview if flagged */}
                    {uploaded?.discrepancyNote && (
                      <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#991B1B' }}>
                        <strong>Deficiency Detected:</strong> {uploaded.discrepancyNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* OCR Live Result Preview */}
            {ocrResult && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#0A2540' }}>Gemini Extraction & Cross-Match Result:</strong>
                  <span style={{ color: ocrResult.verification.hasDiscrepancy ? '#A61C1C' : '#176529', fontWeight: 600 }}>
                    Confidence: {ocrResult.verification.confidenceScore}%
                  </span>
                </div>
                <div style={{ color: '#4A5568' }}>
                  Extracted: Name: <strong>{ocrResult.extracted.candidateName || 'N/A'}</strong> |
                  Income: <strong>{ocrResult.extracted.annualIncome ? `₹${ocrResult.extracted.annualIncome.toLocaleString('en-IN')}` : 'N/A'}</strong> |
                  Authority: <strong>{ocrResult.extracted.issuingAuthority || 'Verified'}</strong>
                </div>
                {ocrResult.verification.explainableDeficiencyReason && (
                  <div style={{ marginTop: '0.35rem', color: '#A61C1C', fontWeight: 500 }}>
                    {ocrResult.verification.explainableDeficiencyReason}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={16} />
              {submitting ? 'Verifying Deduplication & Submitting...' : 'Submit Application to INO'}
            </button>
          </div>
        </form>

        <DigiLockerModal
          isOpen={isDigiLockerOpen}
          onClose={() => setIsDigiLockerOpen(false)}
          applicantId={applicant.id}
          onImportDocument={handleImportDigiLockerDoc}
        />
      </div>
    </div>
  );
};
