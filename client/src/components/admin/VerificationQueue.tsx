import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApplicationItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck, AlertTriangle, CheckCircle,
  RefreshCw, Eye, X, FileSearch
} from 'lucide-react';
import { DocumentVerificationModal } from '../common/DocumentVerificationModal';

interface VerificationQueueProps {
  currentRole: string;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({ currentRole }) => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [qrModalDoc, setQrModalDoc] = useState<any | null>(null);

  // Review modal state
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'FLAGGED_DEFICIENCY' | 'REJECTED' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const activeTier =
    currentRole === 'state-nodal' || currentRole === 'STATE_NODAL' ? 'STATE_NODAL' :
    currentRole === 'mota-admin' || currentRole === 'MOTA_ADMIN' ? 'MOTA_ADMIN' : 'INO';

  const loadQueue = async () => {
    setLoading(true);
    try {
      const resp = await api.getApplications();
      if (resp.success) {
        setApplications(resp.data);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [currentRole]);

  const viewDetails = async (appId: string) => {
    setDetailLoading(true);
    try {
      const resp = await api.getApplicationById(appId);
      if (resp.success) {
        setSelectedApp(resp.data);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteReview = async () => {
    if (!selectedApp || !reviewAction) return;
    setSubmittingAction(true);
    try {
      const resp = await api.reviewApplication(selectedApp.id, {
        tier: activeTier,
        action: reviewAction,
        comments: reviewComments || `Processed as ${reviewAction} by ${activeTier}`,
        reviewerId: `OFFICER-${activeTier}`,
        reviewerName: `${activeTier} Scrutiny Officer`
      });

      if (resp.success) {
        setReviewAction(null);
        setReviewComments('');
        await viewDetails(selectedApp.id);
        await loadQueue();
      }
    } catch (err) {
      console.error('Review action failed:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                Multi-Tier Nodal Scrutiny & Physical Verification Queue
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Current Authority: <strong>{activeTier}</strong> ({
                activeTier === 'INO' ? 'Institute Nodal Officer' :
                activeTier === 'STATE_NODAL' ? 'State Nodal Officer' : 'Ministry Administrator'
              }). Review student credentials, inspect side-by-side AI document extraction flags, and issue explainable determinations.
            </p>
          </div>

          <button onClick={loadQueue} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' : '1fr', gap: '1.5rem', width: '100%', maxWidth: '100%' }}>
        {/* Applications Worklist Table */}
        <div className="gov-card" style={{ minWidth: 0 }}>
          <div className="gov-card-header">
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
              Pending Scrutiny Worklist ({applications.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#718096' }}>Click row to scrutinize</span>
          </div>

          {applications.length === 0 ? (
            <div className="gov-empty-state">
              <div className="gov-empty-icon">
                <CheckCircle size={24} />
              </div>
              <h4 style={{ color: '#0A2540' }}>Queue Clean & Verified</h4>
              <p style={{ fontSize: '0.8125rem', color: '#718096', maxWidth: '380px' }}>
                There are currently no pending applications requiring scrutiny at the {activeTier} level.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student & Category</th>
                    <th>Scheme</th>
                    <th>AI Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => viewDetails(app.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedApp?.id === app.id ? '#EBF3FC' : 'transparent'
                    }}
                  >
                    <td>
                      <strong>{app.id}</strong>
                      <div style={{ fontSize: '0.6875rem', color: '#718096' }}>{app.applicantState}</div>
                    </td>
                    <td>
                      <div>{app.applicantName}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#1A4D8F', fontWeight: 600 }}>
                        {app.applicantCategory.replace('_', ' ')}
                      </div>
                    </td>
                    <td>
                      <div><strong>{app.schemeCode}</strong></div>
                      <div style={{ fontSize: '0.6875rem', color: '#718096' }}>{app.schemeLevel}</div>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: app.aiDiscrepancyScore < 60 ? '#A61C1C' : '#176529'
                      }}>
                        {app.aiDiscrepancyScore}%
                      </span>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); viewDetails(app.id); }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Side-by-Side Scrutiny & AI Document Intelligence Panel */}
        {selectedApp && (
          <div className="gov-card" style={{ borderTop: '4px solid #1A4D8F', minWidth: 0 }}>
            <div className="gov-card-header">
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#1A4D8F', fontWeight: 600, textTransform: 'uppercase' }}>
                  Application Scrutiny Dossier
                </span>
                <h3 style={{ fontSize: '1.125rem', color: '#0A2540' }}>
                  {selectedApp.applicant.name} ({selectedApp.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
                Loading dossier details...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Status & Stage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '4px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#718096' }}>Current Stage:</span>
                    <strong style={{ fontSize: '0.8125rem', display: 'block', color: '#0A2540' }}>
                      {selectedApp.currentStage}
                    </strong>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>

                {/* AI Explainable Flag Banner */}
                {selectedApp.status === 'DEFICIENCY_FLAGGED' && (
                  <div style={{ backgroundColor: '#FDF0ED', border: '1px solid #F7B8B8', padding: '0.875rem', borderRadius: '4px', display: 'flex', gap: '0.5rem' }}>
                    <AlertTriangle size={18} style={{ color: '#A61C1C', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem', color: '#742A2A' }}>
                      <strong>AI Deficiency Warning:</strong>
                      <p style={{ marginTop: '0.2rem', lineHeight: 1.4 }}>
                        {selectedApp.explainableStatus}
                      </p>
                    </div>
                  </div>
                )}

                {/* Form vs Extracted Comparison */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#F1F5F9', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.75rem', color: '#0A2540' }}>
                    Deterministic Verification Cross-Check
                  </div>
                  <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Social Category:</span>
                      <strong>{selectedApp.applicant.category}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Form Income:</span>
                      <strong>₹{selectedApp.applicant.annualIncome.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Scheme Income Ceiling:</span>
                      <strong>
                        {selectedApp.scheme.incomeCeiling ? `₹${selectedApp.scheme.incomeCeiling.toLocaleString('en-IN')}` : 'No Ceiling'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Academic Score:</span>
                      <strong>{selectedApp.applicant.academicPercentage}%</strong>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', color: '#0A2540', marginBottom: '0.5rem' }}>
                    Submitted Certificates & Gemini OCR Metadata ({selectedApp.documents.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedApp.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: '4px',
                          border: `1px solid ${doc.status === 'DEFICIENCY_FLAGGED' ? '#F7B8B8' : '#E2E8F0'}`,
                          backgroundColor: doc.status === 'DEFICIENCY_FLAGGED' ? '#FFFDFD' : '#FFFFFF',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#0A2540' }}>{doc.docType}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setQrModalDoc(doc)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              title="Inspect Government Certificate & AI Verification Details"
                            >
                              <FileSearch size={12} /> Inspect & Verify Document
                            </button>
                            <StatusBadge status={doc.status} />
                          </div>
                        </div>
                        <div style={{ color: '#718096', marginTop: '0.2rem' }}>
                          File: {doc.fileName}
                        </div>

                        {doc.ocrExtracted && (
                          <div style={{ marginTop: '0.35rem', backgroundColor: '#F8FAFC', padding: '0.4rem', borderRadius: '3px', color: '#334155' }}>
                            Extracted Name: <strong>{doc.ocrExtracted.candidateName || 'N/A'}</strong> |
                            Authority: <strong>{doc.ocrExtracted.issuingAuthority || 'Verified'}</strong>
                            {(doc.ocrExtracted.annualIncome != null || doc.ocrExtracted.annualIncomeInr != null) && (
                              <span> | Income: <strong>₹{(doc.ocrExtracted.annualIncome ?? doc.ocrExtracted.annualIncomeInr).toLocaleString('en-IN')}</strong></span>
                            )}
                          </div>
                        )}

                        {doc.discrepancyNote && (
                          <div style={{ marginTop: '0.35rem', color: '#A61C1C', fontWeight: 500 }}>
                            Note: {doc.discrepancyNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scrutiny Action Buttons */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0A2540' }}>
                    Take Formal Verification Action ({activeTier}):
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setReviewAction('APPROVED')}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#1B7837', borderColor: '#1B7837' }}
                    >
                      <CheckCircle size={14} /> Approve & Forward
                    </button>

                    <button
                      onClick={() => setReviewAction('FLAGGED_DEFICIENCY')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#945B00', borderColor: '#FCD680', backgroundColor: '#FFF8E6' }}
                    >
                      <AlertTriangle size={14} /> Flag Specific Deficiency
                    </button>

                    <button
                      onClick={() => setReviewAction('REJECTED')}
                      className="btn btn-danger btn-sm"
                    >
                      Reject Application
                    </button>
                  </div>

                  {/* Comment box when action selected */}
                  {reviewAction && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>
                        Remarks & Official Scrutiny Notes for <strong>{reviewAction}</strong>
                      </label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder={`Enter formal justification or deficiency details (e.g. 'Physical caste certificate verified' or 'Income exceeds ceiling limit')...`}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => setReviewAction(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleExecuteReview}
                          className="btn btn-primary btn-sm"
                          disabled={submittingAction}
                        >
                          {submittingAction ? 'Recording...' : 'Confirm Action & Sign Off'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DocumentVerificationModal
        isOpen={!!qrModalDoc}
        onClose={() => setQrModalDoc(null)}
        documentTitle={qrModalDoc?.fileName || qrModalDoc?.docType || 'Income & Caste Certificate'}
        document={qrModalDoc}
        applicant={selectedApp?.applicant}
        scheme={selectedApp?.scheme}
        applicationId={selectedApp?.id}
        onUpdateStatus={(newStatus) => {
          if (qrModalDoc) {
            setQrModalDoc({ ...qrModalDoc, status: newStatus });
          }
          if (selectedApp) {
            setSelectedApp({
              ...selectedApp,
              documents: selectedApp.documents.map((d: any) =>
                d.id === qrModalDoc?.id ? { ...d, status: newStatus } : d
              )
            });
          }
          loadQueue();
        }}
      />
    </div>
  );
};
