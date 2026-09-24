import React, { useState } from 'react';
import { api } from '../../services/api';
import type { SchemeMatchResult } from '../../types';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Compass,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ScholarshipTwinProps {
  onSelectSchemeToApply?: (schemeCode: string) => void;
}

export const ScholarshipTwin: React.FC<ScholarshipTwinProps> = ({ onSelectSchemeToApply }) => {
  const [category, setCategory] = useState('PVTG');
  const [annualIncome, setAnnualIncome] = useState('180000');
  const [courseLevel, setCourseLevel] = useState('UG');
  const [academicPercentage, setAcademicPercentage] = useState('74');
  const [age, setAge] = useState('21');
  const [isPwD, setIsPwD] = useState(false);
  const [qsRank, setQsRank] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SchemeMatchResult[] | null>(null);
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'schemes' | 'roadmap'>('schemes');

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.runSimulator({
        category,
        annualIncome: Number(annualIncome),
        courseLevel,
        academicPercentage: Number(academicPercentage),
        age: Number(age),
        isPwD,
        isPVTG: category === 'PVTG',
        qsRank: qsRank ? Number(qsRank) : undefined
      });
      if (resp && resp.success) {
        setResults(resp.matches);
        if (resp.roadmap) {
          setRoadmap(resp.roadmap);
        }
      }
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ backgroundColor: '#EBF3FC', padding: '0.75rem', borderRadius: '6px', color: '#1A4D8F' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0A2540', marginBottom: '0.25rem' }}>
              Scholarship Twin — Predictive Eligibility Simulator
            </h2>
            <p style={{ color: '#4A5568', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Check your eligibility across all five Ministry of Tribal Affairs scholarship and fellowship schemes simultaneously before filing a formal application. This simulation eliminates wasted submissions and filters out ineligible filings automatically.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Simulator Form Card */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>Candidate Profile Parameters</h3>
            <span style={{ fontSize: '0.75rem', color: '#718096' }}>Instant Pre-check</span>
          </div>

          <form onSubmit={handleSimulate}>
            <div className="form-group">
              <label className="form-label">Social & Reservation Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="PVTG">Particularly Vulnerable Tribal Group (PVTG)</option>
                <option value="DIVYANGJAN">ST with Disability (PwD ≥ 40%)</option>
                <option value="FEMALE_ST">Female Scheduled Tribe (ST)</option>
                <option value="ST_OTHER">Scheduled Tribe (ST Others / General ST)</option>
                <option value="GENERAL">General / Unreserved (Simulation Test)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Annual Family Income (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="e.g. 200000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 25"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Academic Level</label>
              <select
                className="form-select"
                value={courseLevel}
                onChange={(e) => setCourseLevel(e.target.value)}
              >
                <option value="Class IX-X">Pre-Matric (Class IX - X)</option>
                <option value="Class XI-XII">Higher Secondary (Class XI - XII)</option>
                <option value="UG">Undergraduate (B.A., B.Sc., B.Tech in Notified Institute)</option>
                <option value="PG">Postgraduate (M.A., M.Sc., M.Tech)</option>
                <option value="M.Phil/Ph.D">Research Scholar (M.Phil / Ph.D in India)</option>
                <option value="Overseas">Overseas Studies (Master’s / Ph.D Abroad)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Qualifying Marks (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={academicPercentage}
                  onChange={(e) => setAcademicPercentage(e.target.value)}
                  placeholder="e.g. 75"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">QS World Rank (if Overseas)</label>
                <input
                  type="number"
                  className="form-input"
                  value={qsRank}
                  onChange={(e) => setQsRank(e.target.value)}
                  placeholder="e.g. 3 (Oxford)"
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="pwdCheckbox"
                checked={isPwD}
                onChange={(e) => setIsPwD(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="pwdCheckbox" style={{ fontSize: '0.8125rem', color: '#1A1A1A', cursor: 'pointer' }}>
                Applicant holds certified disability (Divyangjan PwD ≥ 40%)
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
              disabled={loading}
            >
              <Sparkles size={16} />
              {loading ? 'Evaluating Policy Rules...' : 'Compute Instant Scheme Matches'}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!results && (
            <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', textAlign: 'center', color: '#718096' }}>
              <Sparkles size={40} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', color: '#4A5568', marginBottom: '0.5rem' }}>Ready for Simulation</h3>
              <p style={{ fontSize: '0.8125rem', maxWidth: '300px' }}>
                Adjust the criteria on the left and click "Compute Instant Scheme Matches" to view real-time eligibility scores.
              </p>
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Tab Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('schemes')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: activeViewTab === 'schemes' ? '#1A4D8F' : '#F1F5F9',
                      color: activeViewTab === 'schemes' ? '#FFFFFF' : '#4A5568'
                    }}
                  >
                    <Sparkles size={14} /> Schemes ({results.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveViewTab('roadmap')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: activeViewTab === 'roadmap' ? '#1A4D8F' : '#F1F5F9',
                      color: activeViewTab === 'roadmap' ? '#FFFFFF' : '#4A5568'
                    }}
                  >
                    <Compass size={14} /> 🎯 Career & Reservation Roadmap
                  </button>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#176529', fontWeight: 600 }}>
                  {results.filter(r => r.isEligible).length} Eligible Schemes Found
                </span>
              </div>

              {/* View 1: Scheme Matches */}
              {activeViewTab === 'schemes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {results.map((r) => (
                    <div
                      key={r.schemeId}
                      className="gov-card"
                      style={{
                        padding: '1.125rem',
                        borderLeft: `4px solid ${r.isEligible ? '#1B7837' : '#C82333'}`,
                        backgroundColor: r.isEligible ? '#FFFFFF' : '#FAFAFA'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#4A5568' }}>
                            CODE: {r.schemeCode}
                          </div>
                          <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', fontWeight: 600 }}>
                            {r.schemeName}
                          </h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: r.isEligible ? '#EAF7EE' : '#FDF0ED',
                            color: r.isEligible ? '#176529' : '#A61C1C'
                          }}>
                            {r.matchScore}% Match
                          </div>
                        </div>
                      </div>

                      {/* Reasons / Blockers */}
                      <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                        {r.reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} style={{ color: '#176529', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle size={12} /> {reason}
                          </div>
                        ))}

                        {r.blockers.map((blocker, idx) => (
                          <div key={idx} style={{ color: '#A61C1C', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <XCircle size={12} /> {blocker}
                          </div>
                        ))}
                      </div>

                      {r.isEligible && onSelectSchemeToApply && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onSelectSchemeToApply(r.schemeCode)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                          >
                            Apply for this Scheme <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: Personalized Academic, Career & Reservation Roadmap */}
              {activeViewTab === 'roadmap' && roadmap && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Candidate Summary Banner */}
                  <div style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>
                        Personalized Career Co-Pilot
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E3A8A' }}>
                        {roadmap.candidateSummary.categoryLabel} • {roadmap.candidateSummary.levelLabel}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
                      {roadmap.candidateSummary.careerStage}
                    </span>
                  </div>

                  {/* Section 1: Academic Pathway */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <GraduationCap size={16} style={{ color: '#1A4D8F' }} />
                      Higher Education & Fellowship Milestones
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {roadmap.academicPath.map((step: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderLeft: '4px solid #1A4D8F',
                            borderRadius: '6px',
                            padding: '0.875rem',
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <div>
                              <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                                {step.stage}
                              </span>
                              <h5 style={{ fontSize: '0.875rem', color: '#0A2540', fontWeight: 700 }}>
                                {step.title}
                              </h5>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              {step.estimatedFinancialSupport}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Scheme: {step.schemeAlignment}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            {step.keyBenefits.map((b: string, idx: number) => (
                              <div key={idx} style={{ fontSize: '0.75rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <CheckCircle size={12} style={{ color: '#16A34A', flexShrink: 0 }} /> {b}
                              </div>
                            ))}
                          </div>

                          <div style={{ fontSize: '0.6875rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px dashed #CBD5E1' }}>
                            <strong>Action Required:</strong> {step.actionRequired}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Statutory Affirmative Action & Constitutional Rights */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={16} style={{ color: '#15803D' }} />
                      Statutory Affirmative Action & Constitutional Rights
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {roadmap.statutoryEntitlements.map((ent: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '0.875rem',
                            backgroundColor: '#F8FAFC'
                          }}
                        >
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.2rem' }}>
                            {ent.title}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#1E40AF', fontStyle: 'italic', marginBottom: '0.4rem' }}>
                            {ent.ruleCitation}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.4, margin: 0 }}>
                            {ent.benefitDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Career Gateways */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Briefcase size={16} style={{ color: '#7C3AED' }} />
                      Public Sector & Competitive Exam Gateways
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {roadmap.careerGateways.map((gw: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '0.875rem',
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.25rem' }}>
                            {gw.sector}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#6B21A8', fontWeight: 600, marginBottom: '0.4rem' }}>
                            Key Exams: {gw.exams.join(' • ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                            <strong>ST Privilege:</strong> {gw.stPrivilege}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#15803D', backgroundColor: '#F0FDF4', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                            💡 {gw.preparationTip}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Documentation Checklist */}
                  <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '0.875rem 1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400E', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={15} /> Mandatory Documentation Checklist for Tribal Beneficiaries
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#78350F', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {roadmap.documentationChecklist.map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
