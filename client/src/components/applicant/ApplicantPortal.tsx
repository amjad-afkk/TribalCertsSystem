import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApplicationItem, Applicant } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText, AlertTriangle, CheckCircle, Clock,
  PlusCircle, RefreshCw, Send
} from 'lucide-react';

interface ApplicantPortalProps {
  currentRole: string;
  onOpenApplyModal: () => void;
}

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({ currentRole, onOpenApplyModal }) => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitText, setResubmitText] = useState('');
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  // Map persona to applicant ID
  const applicantId =
    currentRole === 'applicant-amitabh'
      ? 'app-user-05'
      : currentRole === 'applicant-sunita'
      ? 'app-user-03'
      : 'app-user-01'; // Default: Pooja Maravi

  const loadData = async () => {
    setLoading(true);
    try {
      const [appResp, applicantsResp] = await Promise.all([
        api.getApplications({ applicantId }),
        api.getApplicants()
      ]);

      if (appResp.success && Array.isArray(appResp.data)) {
        setApplications(appResp.data);
      }
      if (applicantsResp.success && Array.isArray(applicantsResp.data)) {
        const found = applicantsResp.data.find((a: any) => a.id === applicantId);
        if (found) setApplicant(found);
      }
    } catch (err) {
      console.error('Error fetching applicant data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setResubmitSuccess(false);
  }, [currentRole]);

  const handleResubmit = async (appId: string) => {
    if (!resubmitText.trim()) return;
    try {
      const resp = await api.resubmitDeficiency(appId, { explanation: resubmitText });
      if (resp.success) {
        setResubmitSuccess(true);
        setResubmitText('');
        setTimeout(() => {
          setResubmitSuccess(false);
          loadData();
        }, 1200);
      }
    } catch (err) {
      console.error('Error resubmitting deficiency:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.75rem', color: '#1A4D8F' }} />
        <div style={{ fontSize: '0.875rem' }}>Loading your scholarship dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Clean Welcome Banner */}
      <div className="gov-card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #1A4D8F', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
                Welcome, {applicant?.name || 'Pooja Maravi'}
              </h2>
              <span className="badge badge-approved" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                Aadhaar e-KYC Verified
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: '0.35rem 0 0', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>Course: <strong>{applicant?.courseLevel || 'Ph.D Scholar'}</strong></span>
              <span>•</span>
              <span>Institute: <strong>{applicant?.instituteName || 'JNU'}</strong></span>
              <span>•</span>
              <span>Category: <strong>{(applicant?.category || 'PVTG').replace('_', ' ')}</strong></span>
            </p>
          </div>

          <button
            onClick={onOpenApplyModal}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <PlusCircle size={16} />
            <span>Apply for Scheme</span>
          </button>
        </div>
      </div>

      {/* Applications Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
            My Scholarship & Fellowship Applications ({applications.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Academic Year 2026–2027
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="gov-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748B' }}>
            <FileText size={36} style={{ color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#0A2540', fontSize: '1rem', margin: '0 0 0.35rem' }}>No Applications Filed Yet</h4>
            <p style={{ fontSize: '0.8125rem', margin: '0 0 1rem', color: '#64748B' }}>
              Explore available schemes and file an application in minutes.
            </p>
            <button onClick={onOpenApplyModal} className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Start Application
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => {
              const isFlagged = app.status === 'DEFICIENCY_FLAGGED';
              const isDisbursed = app.status === 'DISBURSED';
              const isSelected = app.status === 'SELECTED' || isDisbursed;

              const stages = [
                { id: 1, label: 'Submitted', active: true },
                { id: 2, label: isFlagged ? 'Deficiency' : 'Verified', active: app.status !== 'SUBMITTED', flagged: isFlagged },
                { id: 3, label: 'Scrutiny', active: isSelected || app.currentStage.includes('SCRUTINY') },
                { id: 4, label: 'Selection', active: isSelected || app.currentStage.includes('COMMITTEE') },
                { id: 5, label: 'DBT Disbursed', active: isDisbursed }
              ];

              return (
                <div
                  key={app.id}
                  className="gov-card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderLeft: isFlagged ? '4px solid #C82333' : '4px solid #1A4D8F',
                    boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em' }}>
                        APPLICATION ID: {app.id}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#0A2540', margin: '0.2rem 0 0.15rem', fontWeight: 700 }}>
                        {app.schemeName} ({app.schemeCode})
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Level: {app.schemeLevel}
                      </div>
                    </div>

                    <StatusBadge status={app.status} />
                  </div>

                  {/* Clean Horizontal Stepper */}
                  <div style={{ margin: '1.25rem 0', padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {stages.map((stage, idx) => (
                        <React.Fragment key={stage.id}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 2 }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: stage.flagged ? '#EF4444' : stage.active ? '#1A4D8F' : '#CBD5E1',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6875rem',
                                fontWeight: 700
                              }}
                            >
                              {stage.flagged ? '!' : stage.active ? '✓' : stage.id}
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: stage.active ? '#0A2540' : '#94A3B8', fontWeight: stage.active ? 600 : 400 }}>
                              {stage.label}
                            </span>
                          </div>

                          {idx < stages.length - 1 && (
                            <div
                              style={{
                                flex: 1,
                                height: '2px',
                                backgroundColor: stages[idx + 1].active ? '#1A4D8F' : '#E2E8F0',
                                margin: '0 0.5rem',
                                marginBottom: '1.1rem'
                              }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Explainable Status */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: isFlagged ? '#FEF2F2' : '#F1F5F9',
                    border: `1px solid ${isFlagged ? '#FECACA' : '#E2E8F0'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem'
                  }}>
                    {isFlagged ? (
                      <AlertTriangle size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Clock size={18} style={{ color: '#1A4D8F', flexShrink: 0, marginTop: '2px' }} />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <strong style={{ color: isFlagged ? '#991B1B' : '#0A2540' }}>
                          Status Update:
                        </strong>
                        <span style={{ color: '#64748B' }}>
                          AI Confidence: <strong>{app.aiDiscrepancyScore}%</strong>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#334155', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                        {app.explainableStatus}
                      </p>

                      {isFlagged && app.deficiencyReason && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#FFFFFF',
                          borderLeft: '3px solid #DC2626',
                          fontSize: '0.75rem',
                          color: '#991B1B',
                          fontWeight: 500
                        }}>
                          <strong>Action Required:</strong> {app.deficiencyReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deficiency Resubmission Form */}
                  {isFlagged && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '5px' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RefreshCw size={14} /> Provide Clarification / Updated Document Reference
                      </div>

                      {resubmitSuccess ? (
                        <div style={{ color: '#166534', backgroundColor: '#DCFCE7', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={15} /> Clarification submitted to scrutiny officer!
                        </div>
                      ) : (
                        <div>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            value={resubmitText}
                            onChange={(e) => setResubmitText(e.target.value)}
                            placeholder="Enter clarification or note regarding the uploaded certificate..."
                            style={{ marginBottom: '0.5rem', fontSize: '0.8125rem' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleResubmit(app.id)}
                              className="btn btn-primary btn-sm"
                              disabled={!resubmitText.trim()}
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Send size={13} /> Submit Clarification
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
