import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Scheme } from '../../types';
import { Sliders, PlusCircle, CheckCircle2 } from 'lucide-react';

export const SchemeConfigurator: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // New scheme form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Undergraduate / Postgraduate');
  const [incomeCeiling, setIncomeCeiling] = useState('300000');
  const [hasNoIncomeCap, setHasNoIncomeCap] = useState(false);
  const [ageCeiling, setAgeCeiling] = useState('');
  const [academicThreshold, setAcademicThreshold] = useState('60');
  const [quotaType, setQuotaType] = useState<'UNCAPPED' | 'FIXED_SLOTS'>('UNCAPPED');
  const [totalSlots, setTotalSlots] = useState('');
  const [selectionMethod, setSelectionMethod] = useState<'AUTO_GATE' | 'MERIT_WATERFALL' | 'TIERED_PRIORITY'>('AUTO_GATE');
  const [disbursementFrequency, setDisbursementFrequency] = useState<'ANNUAL' | 'QUARTERLY' | 'SEMESTER_FOREX'>('ANNUAL');

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const resp = await api.getSchemes();
      if (resp.success) {
        setSchemes(resp.data);
      }
    } catch (err) {
      console.error('Error loading schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.createScheme({
        code: code.toUpperCase().trim(),
        name,
        level,
        description: `Dynamically onboarded via MoTA Rules Engine Console for ${name}.`,
        incomeCeiling: hasNoIncomeCap ? null : Number(incomeCeiling),
        ageCeiling: ageCeiling ? Number(ageCeiling) : null,
        academicThreshold: academicThreshold ? Number(academicThreshold) : null,
        quotaType,
        totalSlots: quotaType === 'FIXED_SLOTS' && totalSlots ? Number(totalSlots) : null,
        selectionMethod,
        disbursementFrequency,
        documentChecklist: [
          { docType: 'CASTE_CERT', title: 'Scheduled Tribe Community Certificate', required: true },
          { docType: 'INCOME_CERT', title: 'Competent Authority Income Certificate', required: !hasNoIncomeCap },
          { docType: 'PREV_MARKSHEET', title: 'Qualifying Marksheet', required: true }
        ],
        reservationWaterfall: selectionMethod === 'MERIT_WATERFALL' ? [
          { tier: 'PVTG', label: 'PVTG Priority', priority: 1, allocatedSlots: 20 },
          { tier: 'FEMALE_ST', label: 'Female ST Sub-quota', priority: 2, allocatedSlots: 30 },
          { tier: 'ST_GENERAL', label: 'General ST', priority: 3, allocatedSlots: 50 }
        ] : []
      });

      if (resp.success) {
        setCreateSuccess(true);
        setTimeout(() => {
          setIsCreating(false);
          setCreateSuccess(false);
          // reset form
          setCode('');
          setName('');
          loadSchemes();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create scheme:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sliders size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                No-Code / Low-Code Scheme Configuration Engine (Section 4.8)
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Define, onboard, and parameterize new tribal scholarship schemes dynamically without requiring engineering code deployments or schema rebuilds.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> {isCreating ? 'Cancel Creation' : 'Onboard New Scheme'}
          </button>
        </div>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="gov-card" style={{ borderTop: '4px solid #1B7837' }}>
          <div className="gov-card-header">
            <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
              Define Scheme Policy Parameters & Rules Engine Constraints
            </h3>
          </div>

          {createSuccess ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#166534', backgroundColor: '#DCFCE7', borderRadius: '4px' }}>
              <CheckCircle2 size={28} style={{ margin: '0 auto 0.5rem' }} />
              <h4>Scheme Successfully Onboarded!</h4>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Rules engine initialized and ready for immediate applicant submissions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateScheme}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Official Scheme Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ST-STEM-26"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Scheme Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. National Tribal STEM Fellowship"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Academic Level</label>
                  <input
                    type="text"
                    className="form-input"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Annual Family Income Cap (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={incomeCeiling}
                    onChange={(e) => setIncomeCeiling(e.target.value)}
                    disabled={hasNoIncomeCap}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <input
                      type="checkbox"
                      id="noCap"
                      checked={hasNoIncomeCap}
                      onChange={(e) => setHasNoIncomeCap(e.target.checked)}
                    />
                    <label htmlFor="noCap" style={{ fontSize: '0.75rem', color: '#4A5568' }}>No Income Cap (Merit-based)</label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Age Limit (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Leave blank if uncapped"
                    value={ageCeiling}
                    onChange={(e) => setAgeCeiling(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min. Academic Percentage (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={academicThreshold}
                    onChange={(e) => setAcademicThreshold(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Quota Capacity Model</label>
                  <select
                    className="form-select"
                    value={quotaType}
                    onChange={(e) => setQuotaType(e.target.value as any)}
                  >
                    <option value="UNCAPPED">Uncapped (Demand Driven / All Eligible)</option>
                    <option value="FIXED_SLOTS">Fixed Annual Slot Quota</option>
                  </select>
                </div>

                {quotaType === 'FIXED_SLOTS' && (
                  <div className="form-group">
                    <label className="form-label">Total Annual Slots</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 500"
                      value={totalSlots}
                      onChange={(e) => setTotalSlots(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Selection Method Engine</label>
                  <select
                    className="form-select"
                    value={selectionMethod}
                    onChange={(e) => setSelectionMethod(e.target.value as any)}
                  >
                    <option value="AUTO_GATE">Rule-Based Auto-Gate</option>
                    <option value="MERIT_WATERFALL">Merit-Ranked 4-Tier Waterfall</option>
                    <option value="TIERED_PRIORITY">Multi-Priority Tiered (NOS Model)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Disbursement Cycle</label>
                  <select
                    className="form-select"
                    value={disbursementFrequency}
                    onChange={(e) => setDisbursementFrequency(e.target.value as any)}
                  >
                    <option value="ANNUAL">Annual Lump-Sum DBT</option>
                    <option value="QUARTERLY">Quarterly Research Fellowship</option>
                    <option value="SEMESTER_FOREX">Semester Foreign Exchange (Missions)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Deploy Scheme Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Currently Configured Schemes Table */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
            Active MoTA Scheme Registry ({schemes.length} Configured)
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            Zero-code declarative rules engine
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Scheme Name</th>
                <th>Academic Level</th>
                <th>Income Cap</th>
                <th>Quota Type</th>
                <th>Selection Logic</th>
                <th>Disbursement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.code}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0A2540' }}>{s.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#718096' }}>{s.legacyPortal}</div>
                  </td>
                  <td>{s.level}</td>
                  <td>
                    {s.incomeCeiling ? `≤ ₹${s.incomeCeiling.toLocaleString('en-IN')}` : <span style={{ color: '#1B7837' }}>Uncapped</span>}
                  </td>
                  <td>{s.quotaType === 'FIXED_SLOTS' ? `${s.totalSlots} Slots` : 'Uncapped'}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                      {s.selectionMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{s.disbursementFrequency}</td>
                  <td>
                    <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
