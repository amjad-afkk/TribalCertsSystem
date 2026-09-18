import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Award, Clock, CheckCircle2, RefreshCw, BookOpen, Calendar
} from 'lucide-react';

interface FellowshipPortalProps {
  applicantId: string;
}

export const FellowshipPortal: React.FC<FellowshipPortalProps> = ({ applicantId }) => {
  const [fellowship, setFellowship] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Joining form state
  const [joiningSupervisor, setJoiningSupervisor] = useState('');
  const [isSubmittingJoining, setIsSubmittingJoining] = useState(false);

  // Continuation report modal/form
  const [isContinuationModalOpen, setIsContinuationModalOpen] = useState(false);
  const [attendance, setAttendance] = useState('95');
  const [progressSummary, setProgressSummary] = useState('');
  const [isSubmittingContinuation, setIsSubmittingContinuation] = useState(false);

  // Thesis submission modal/form
  const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);
  const [thesisTitle, setThesisTitle] = useState('');
  const [isSubmittingThesis, setIsSubmittingThesis] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await api.getFellowshipRecord(applicantId);
      if (resp.success) {
        setFellowship(resp.data);
        if (resp.data.thesis_title) {
          setThesisTitle(resp.data.thesis_title);
        }
      }
    } catch (err) {
      console.error('Failed to load fellowship record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicantId]);

  const handleConfirmJoining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship || !joiningSupervisor.trim()) return;
    setIsSubmittingJoining(true);
    try {
      const resp = await api.submitJoiningReport({
        fellowshipId: fellowship.id,
        supervisorName: joiningSupervisor
      });
      if (resp.success) {
        await loadData();
      }
    } catch (err) {
      console.error('Joining report error:', err);
    } finally {
      setIsSubmittingJoining(false);
    }
  };

  const handleSubmitContinuation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship) return;
    setIsSubmittingContinuation(true);
    try {
      const resp = await api.submitContinuationReport({
        fellowshipId: fellowship.id,
        quarterNumber: fellowship.current_quarter,
        academicYear: '2026-2027',
        attendancePercentage: Number(attendance),
        progressSummary: progressSummary || 'Quarterly research targets and field experiments concluded with supervisor review.'
      });
      if (resp.success) {
        setIsContinuationModalOpen(false);
        setProgressSummary('');
        await loadData();
      }
    } catch (err) {
      console.error('Continuation report error:', err);
    } finally {
      setIsSubmittingContinuation(false);
    }
  };

  const handleSubmitThesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship || !thesisTitle.trim()) return;
    setIsSubmittingThesis(true);
    try {
      const resp = await api.submitThesis({
        fellowshipId: fellowship.id,
        thesisTitle
      });
      if (resp.success) {
        setIsThesisModalOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error('Thesis submit error:', err);
    } finally {
      setIsSubmittingThesis(false);
    }
  };

  if (loading) {
    return (
      <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
        Loading Fellowship Award & Disbursement Lifecycle Portal...
      </div>
    );
  }

  if (!fellowship) {
    return (
      <div className="gov-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Award size={36} style={{ color: '#718096', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#0A2540', marginBottom: '0.5rem' }}>No Active Fellowship Record</h3>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>
          This section manages post-selection milestones for National Fellowship (NFST) and National Overseas Scholarship (NOS) awardees.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Award size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                National Fellowship (NFST) Post-Selection Lifecycle Portal
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Managing 30-day university joining formalities, quarterly continuation certificate stipends, and Ph.D. thesis repository archival (Sections 4.7 & 13.1).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Fellowship Award Active
            </span>
            <button onClick={loadData} className="btn btn-secondary">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Joining Window */}
        <div className="gov-card" style={{ borderLeft: '3px solid #1A4D8F' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>30-Day Joining Window (FR-7.1)</span>
              <h3 style={{ fontSize: '1.25rem', color: '#0A2540', marginTop: '0.25rem' }}>
                {fellowship.joining_status === 'CONFIRMED' ? (
                  <span style={{ color: '#176529' }}>✓ Joining Confirmed</span>
                ) : (
                  <span style={{ color: '#E06D14' }}>{fellowship.daysRemainingJoining} Days Remaining</span>
                )}
              </h3>
            </div>
            <Clock size={20} style={{ color: '#1A4D8F' }} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#718096', marginTop: '0.35rem' }}>
            Deadline: {new Date(fellowship.joining_deadline).toLocaleDateString()}
          </p>
        </div>

        {/* Metric 2: Current Fellowship Cycle */}
        <div className="gov-card" style={{ borderLeft: '3px solid #1B7837' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Current Research Quarter</span>
              <h3 style={{ fontSize: '1.25rem', color: '#1B7837', marginTop: '0.25rem' }}>
                Quarter {fellowship.current_quarter} (Year 1)
              </h3>
            </div>
            <Calendar size={20} style={{ color: '#1B7837' }} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#718096', marginTop: '0.35rem' }}>
            Monthly Fellowship Rate: ₹31,000 + Contingency
          </p>
        </div>

        {/* Metric 3: Thesis Repository Gate */}
        <div className="gov-card" style={{ borderLeft: '3px solid #92400E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Thesis Archival Gate (FR-7.3)</span>
              <h3 style={{ fontSize: '1.125rem', color: '#0A2540', marginTop: '0.25rem' }}>
                {fellowship.thesis_status === 'ARCHIVED_IN_REPOSITORY' ? (
                  <span style={{ color: '#176529' }}>✓ Archived in MoTA Repo</span>
                ) : (
                  <span style={{ color: '#92400E' }}>Pending Deposition</span>
                )}
              </h3>
            </div>
            <BookOpen size={20} style={{ color: '#92400E' }} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#718096', marginTop: '0.35rem' }}>
            Consolidates repository.tribal.gov.in
          </p>
        </div>
      </div>

      {/* SECTION 1: 30-DAY JOINING FORMALITIES (FR-7.1) */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>1. University Joining Report & Guide Acceptance (FR-7.1)</h3>
            <p style={{ fontSize: '0.75rem', color: '#718096' }}>
              Statutory 30-day window to complete university joining formalities post-award
            </p>
          </div>
          <span className={`badge ${fellowship.joining_status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>
            {fellowship.joining_status === 'CONFIRMED' ? 'Verified & On Record' : 'Pending Guide Sign-off'}
          </span>
        </div>

        {fellowship.joining_status === 'CONFIRMED' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#718096', fontSize: '0.75rem' }}>Research Supervisor:</span>
              <div style={{ fontWeight: 600, color: '#0A2540' }}>{fellowship.supervisor_name}</div>
            </div>
            <div>
              <span style={{ color: '#718096', fontSize: '0.75rem' }}>University / Institute:</span>
              <div style={{ fontWeight: 600, color: '#0A2540' }}>{fellowship.institute_name}</div>
            </div>
            <div>
              <span style={{ color: '#718096', fontSize: '0.75rem' }}>Joining Document Status:</span>
              <div style={{ color: '#176529', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={14} /> Official Joining Certificate Verified
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmJoining} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFF8E6', padding: '0.75rem', borderRadius: '4px', border: '1px solid #FCD680', fontSize: '0.8125rem', color: '#945B00' }}>
              Please enter your research guide's name and upload the university joining acceptance letter to avoid automatic seat cancellation under the 30-day statutory mandate.
            </div>

            <div className="form-group">
              <label className="form-label">Research Guide / Ph.D. Supervisor Name</label>
              <input
                type="text"
                className="form-input"
                value={joiningSupervisor}
                onChange={(e) => setJoiningSupervisor(e.target.value)}
                placeholder="e.g. Prof. Ananya Sen, School of Social Sciences, JNU"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingJoining}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              {isSubmittingJoining ? 'Submitting Joining Report...' : 'Submit University Joining Report'}
            </button>
          </form>
        )}
      </div>

      {/* SECTION 2: QUARTERLY CONTINUATION CERTIFICATES (FR-7.2) */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>2. Quarterly Continuation Certificates & PFMS Release (FR-7.2)</h3>
            <p style={{ fontSize: '0.75rem', color: '#718096' }}>
              Submission of supervisor attendance and progress report required before each recurring PFMS disbursement
            </p>
          </div>

          <button
            onClick={() => setIsContinuationModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            + Submit Q{fellowship.current_quarter} Continuation Report
          </button>
        </div>

        {/* Continuation Reports Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Academic Year</th>
                <th>Attendance %</th>
                <th>Research Milestone Summary</th>
                <th>PFMS DBT Ref</th>
                <th>Stipend Amount</th>
                <th>Disbursement Status</th>
              </tr>
            </thead>
            <tbody>
              {fellowship.continuationReports && fellowship.continuationReports.length > 0 ? (
                fellowship.continuationReports.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>Quarter {r.quarter_number}</td>
                    <td>{r.academic_year}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: r.attendance_percentage >= 75 ? '#176529' : '#A61C1C' }}>
                        {r.attendance_percentage}%
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8125rem' }}>{r.progress_summary}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#1A4D8F' }}>
                      {r.pfms_transaction_id || 'PENDING'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1B7837' }}>
                      ₹{Number(r.stipend_amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#718096' }}>
                    No continuation reports filed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PH.D. THESIS REPOSITORY GATE (FR-7.3) */}
      <div className="gov-card" style={{ borderLeft: '4px solid #0056B3' }}>
        <div className="gov-card-header">
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>3. National Tribal Research Repository Thesis Gate (FR-7.3)</h3>
            <p style={{ fontSize: '0.75rem', color: '#718096' }}>
              Final fellowship quarter release is escrow-gated until Ph.D. thesis is deposited into repository.tribal.gov.in
            </p>
          </div>

          <span className={`badge ${fellowship.thesis_status === 'ARCHIVED_IN_REPOSITORY' ? 'badge-success' : 'badge-warning'}`}>
            {fellowship.thesis_status === 'ARCHIVED_IN_REPOSITORY' ? 'Thesis Archived & Escrow Released' : 'Final Grant Escrow Locked'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Under MoTA Fellowship Guidelines, the final quarter grant (₹93,000) is held in escrow until the scholar successfully deposits their Ph.D. research thesis into the <strong>National Tribal Research Repository</strong>.
            </p>

            {fellowship.thesis_archive_id ? (
              <div style={{ backgroundColor: '#EAF7EE', border: '1px solid #A3E0B5', padding: '0.85rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 700, color: '#176529', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> Repository Archive Reference Number Issued
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9375rem', color: '#0A2540' }}>
                  {fellowship.thesis_archive_id}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.25rem' }}>
                  Thesis Title: <em>"{fellowship.thesis_title}"</em>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsThesisModalOpen(true)}
                className="btn btn-primary"
              >
                <BookOpen size={16} /> Deposit Ph.D. Thesis & Unlock Final Grant
              </button>
            )}
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
            <div style={{ fontWeight: 700, color: '#0A2540', marginBottom: '0.35rem' }}>
              Final Disbursement Lock Status:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: fellowship.final_disbursement_unlocked ? '#176529' : '#A61C1C', fontWeight: 700, fontSize: '1rem' }}>
              {fellowship.final_disbursement_unlocked ? (
                <>✓ Escrow Released (₹93,000 Unlocked)</>
              ) : (
                <>🔒 Escrow Locked (₹93,000 Pending Thesis)</>
              )}
            </div>
            <p style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.35rem' }}>
              PFMS release code TXN-FINAL-RELEASE will be generated automatically upon repository receipt.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: Submit Continuation Report */}
      {isContinuationModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gov-card" style={{ maxWidth: '540px', width: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', marginBottom: '1rem' }}>
              Submit Quarter {fellowship.current_quarter} Continuation Certificate
            </h3>

            <form onSubmit={handleSubmitContinuation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Research Attendance Percentage (Min 75%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quarterly Research Progress Milestone Summary</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={progressSummary}
                  onChange={(e) => setProgressSummary(e.target.value)}
                  placeholder="Summarize fieldwork, experimental results, and draft publications for this quarter..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsContinuationModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContinuation}
                  className="btn btn-primary"
                >
                  {isSubmittingContinuation ? 'Submitting...' : 'Submit & Trigger PFMS Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Thesis */}
      {isThesisModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gov-card" style={{ maxWidth: '540px', width: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', marginBottom: '1rem' }}>
              Deposit Ph.D. Thesis into National Tribal Research Repository
            </h3>

            <form onSubmit={handleSubmitThesis} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Ph.D. Research Thesis Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={thesisTitle}
                  onChange={(e) => setThesisTitle(e.target.value)}
                  placeholder="e.g. Ethnobotany and Indigenous Healing Systems of the Baiga Community"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsThesisModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThesis}
                  className="btn btn-primary"
                >
                  {isSubmittingThesis ? 'Archiving...' : 'Archive Thesis & Unlock Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
