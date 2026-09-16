import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApplicationItem, Applicant } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck, FileText, AlertTriangle, CheckCircle, Clock,
  UploadCloud, RefreshCw, Send
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

      if (appResp.success) {
        setApplications(appResp.data);
      }
      if (applicantsResp.success) {
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
      <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
        Loading Applicant Portal & Digital Twin Journey...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Profile & Identity Card */}
      {applicant && (
        <div className="gov-card" style={{ borderTop: '4px solid #1A4D8F' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#EBF3FC',
                color: '#1A4D8F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}>
                {applicant.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>{applicant.name || 'Pooja Maravi'}</h2>
                  <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                    Aadhaar e-KYC Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#4A5568', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span>Aadhaar: <strong>{applicant.aadhaarMasked || 'XXXX-XXXX-4123'}</strong></span>
                  <span>Category: <strong>{(applicant.category || 'PVTG').replace('_', ' ')}</strong></span>
                  <span>State: <strong>{applicant.state || 'National'}</strong></span>
                  <span>Institute: <strong>{applicant.instituteName || 'Notified Institute'}</strong></span>
                  <span>Certified Income: <strong>₹{(applicant.annualIncome ?? 0).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>

            <button onClick={onOpenApplyModal} className="btn btn-primary">
              <UploadCloud size={16} /> Apply for New Scheme
            </button>
          </div>
        </div>
      )}

      {/* One Nation One Scholarship Fraud Shield Indicator */}
      <div className="gov-card" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#166534' }}>
              One Nation One Scholarship ID Engine Active
            </span>
            <p style={{ fontSize: '0.75rem', color: '#15803D' }}>
              Candidate profile synchronized across all MoTA databases. Concurrent dual-benefit cross-checks clear.
            </p>
          </div>
        </div>
      </div>

      {/* Active Applications with Digital Twin Journey */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', color: '#0A2540' }}>
          My Active Scholarship & Fellowship Applications ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <FileText size={40} style={{ color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
            <h4>No Active Applications Found</h4>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Click "Apply for New Scheme" above or use the Scholarship Twin simulator to apply.
            </p>
          </div>
        ) : (
          applications.map((app) => {
            const isFlagged = app.status === 'DEFICIENCY_FLAGGED';
            const isDisbursed = app.status === 'DISBURSED';
            const isSelected = app.status === 'SELECTED' || isDisbursed;

            return (
              <div key={app.id} className="gov-card" style={{ padding: '1.5rem', borderLeft: isFlagged ? '4px solid #C82333' : '4px solid #1A4D8F' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>
                      APPLICATION ID: {app.id} • AY {app.academicYear}
                    </div>
                    <h4 style={{ fontSize: '1.125rem', color: '#0A2540', marginTop: '0.2rem' }}>
                      {app.schemeName} ({app.schemeCode})
                    </h4>
                    <div style={{ fontSize: '0.8125rem', color: '#4A5568', marginTop: '0.2rem' }}>
                      Level: {app.schemeLevel}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Digital Twin Stepper Timeline */}
                <div style={{ margin: '1.75rem 0 1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Digital Twin Processing Lifecycle
                  </div>

                  <div className="stepper-container">
                    <div className="stepper-line" />

                    <div className="stepper-item completed">
                      <div className="stepper-circle">✓</div>
                      <span className="stepper-title">Application Submitted</span>
                    </div>

                    <div className={`stepper-item ${isFlagged ? 'flagged' : app.status !== 'SUBMITTED' ? 'completed' : 'active'}`}>
                      <div className="stepper-circle">{isFlagged ? '!' : '✓'}</div>
                      <span className="stepper-title">
                        {isFlagged ? 'Deficiency Flagged' : 'Document OCR Check'}
                      </span>
                    </div>

                    <div className={`stepper-item ${isSelected ? 'completed' : app.currentStage.includes('SCRUTINY') ? 'active' : ''}`}>
                      <div className="stepper-circle">3</div>
                      <span className="stepper-title">Nodal Scrutiny</span>
                    </div>

                    <div className={`stepper-item ${isSelected ? 'completed' : app.currentStage.includes('COMMITTEE') ? 'active' : ''}`}>
                      <div className="stepper-circle">4</div>
                      <span className="stepper-title">Committee Sign-off</span>
                    </div>

                    <div className={`stepper-item ${isDisbursed ? 'completed' : ''}`}>
                      <div className="stepper-circle">5</div>
                      <span className="stepper-title">DBT Disbursement</span>
                    </div>
                  </div>
                </div>

                {/* Explainable Status Box (Section 5.6) */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '4px',
                  backgroundColor: isFlagged ? '#FDF0ED' : '#F8FAFC',
                  border: `1px solid ${isFlagged ? '#F7B8B8' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  {isFlagged ? (
                    <AlertTriangle size={20} style={{ color: '#A61C1C', flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <Clock size={20} style={{ color: '#1A4D8F', flexShrink: 0, marginTop: '2px' }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isFlagged ? '#A61C1C' : '#0A2540' }}>
                        Explainable Processing Rationale
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#718096' }}>
                        AI OCR Confidence: <strong>{app.aiDiscrepancyScore}%</strong>
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: '#2D3748', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {app.explainableStatus}
                    </p>

                    {isFlagged && app.deficiencyReason && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        borderLeft: '3px solid #C82333',
                        fontSize: '0.75rem',
                        color: '#742A2A',
                        fontWeight: 500
                      }}>
                        <strong>Action Required:</strong> {app.deficiencyReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Deficiency Resubmission Loop (Section 4.4 / FR-4.4) */}
                {isFlagged && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#FFFDF5', border: '1px solid #FCD680', borderRadius: '4px' }}>
                    <h5 style={{ fontSize: '0.875rem', color: '#945B00', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={16} /> Deficiency Resubmission Portal
                    </h5>

                    {resubmitSuccess ? (
                      <div style={{ color: '#166534', backgroundColor: '#DCFCE7', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} /> Clarification submitted successfully! Status updated to RESUBMITTED.
                      </div>
                    ) : (
                      <div>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={resubmitText}
                          onChange={(e) => setResubmitText(e.target.value)}
                          placeholder="Provide explanation or details of corrected certificate (e.g., 'Attached updated Tehsildar income certificate showing actual family income')..."
                          style={{ marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleResubmit(app.id)}
                            className="btn btn-primary btn-sm"
                            disabled={!resubmitText.trim()}
                          >
                            <Send size={14} /> Submit Clarification to Scrutiny Officer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
