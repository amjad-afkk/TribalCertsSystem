import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Scheme, Applicant } from '../../types';
import { X, CheckCircle, Sparkles, Send, ShieldAlert } from 'lucide-react';

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
    status: string;
    extracted?: any;
    discrepancyNote?: string | null;
  }>>([]);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Simulate AI OCR on a chosen document type
  const handleSimulateAiOcr = async (docType: string, sampleFileName: string) => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const resp = await api.extractAndVerifyDocument({
        docType,
        fileName: sampleFileName,
        formData: {
          candidateName: applicant.name,
          annualIncome: applicant.annualIncome,
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
            fileName: sampleFileName,
            status: resp.verification.hasDiscrepancy ? 'DEFICIENCY_FLAGGED' : 'OCR_VERIFIED',
            extracted: resp.extracted,
            discrepancyNote: resp.verification.explainableDeficiencyReason
          }
        ]);
      }
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
    } finally {
      setOcrLoading(false);
    }
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
        formData,
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
                defaultValue={applicant.instituteName}
                onChange={(e) => handleFieldChange('institute', e.target.value)}
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

          {/* Scheme Document Checklist with Instant AI OCR */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Required Document Verification (AI OCR Supported)
              </label>
              <span style={{ fontSize: '0.6875rem', color: '#1A4D8F', fontWeight: 600 }}>
                Gemini Multimodal OCR Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeScheme?.documentChecklist.map((doc) => {
                const uploaded = uploadedDocs.find(d => d.docType === doc.docType);
                return (
                  <div key={doc.docType} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.875rem',
                    borderRadius: '4px',
                    backgroundColor: uploaded ? '#F0FDF4' : '#FFFFFF',
                    border: `1px solid ${uploaded ? '#BBF7D0' : '#E2E8F0'}`
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1A1A1A' }}>
                        {doc.title} {doc.required && <span style={{ color: '#C82333' }}>*</span>}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#718096' }}>
                        Type: {doc.docType} {uploaded && `• Uploaded: ${uploaded.fileName}`}
                      </div>
                    </div>

                    <div>
                      {uploaded ? (
                        <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSimulateAiOcr(doc.docType, `${applicant.name.toLowerCase().split(' ')[0]}_${doc.docType.toLowerCase()}.pdf`)}
                          className="btn btn-secondary btn-sm"
                          disabled={ocrLoading}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <Sparkles size={12} style={{ color: '#1A4D8F' }} />
                          {ocrLoading ? 'Scanning...' : 'Test AI Upload'}
                        </button>
                      )}
                    </div>
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
      </div>
    </div>
  );
};
