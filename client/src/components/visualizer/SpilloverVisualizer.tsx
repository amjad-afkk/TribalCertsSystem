import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GitFork, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface TierData {
  tierName: string;
  originalQuota: number;
  spilloverReceived: number;
  finalQuota: number;
  selectedCount: number;
  spilloverOut: number;
}

interface TransitionData {
  step: number;
  fromTier: string;
  toTier: string;
  slotsShifted: number;
  reason: string;
}

export const SpilloverVisualizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    totalAvailableSlots: number;
    totalFilledSlots: number;
    unfilledSlots: number;
    tierSummary: Record<string, TierData>;
    transitions: TransitionData[];
    allocatedSelections: any[];
  } | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const resp = await api.runWaterfallSimulation();
      if (resp.success) {
        setData(resp.data);
        setActiveStep(resp.data.transitions.length); // Default to full cascade
      }
    } catch (err) {
      console.error('Waterfall simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  // Animation player
  useEffect(() => {
    let timer: any;
    if (isPlaying && data) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= data.transitions.length) {
            setIsPlaying(false);
            return data.transitions.length;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, data]);

  const handlePlayAnimation = () => {
    setActiveStep(0);
    setIsPlaying(true);
  };

  const tiers = [
    { key: 'DIVYANGJAN', label: 'Tier 1: Divyangjan (PwD ≥ 40%)', base: 38, color: '#1A4D8F' },
    { key: 'PVTG', label: 'Tier 2: PVTG Sub-quota', base: 75, color: '#0A2540' },
    { key: 'FEMALE_ST', label: 'Tier 3: Female ST (30% Sub-quota)', base: 225, color: '#1B7837' },
    { key: 'ST_GENERAL', label: 'Tier 4: Open ST Merit (Others)', base: 412, color: '#E06D14' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Visualizer Overview Header */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <GitFork size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                NFST 4-Tier Reservation Spillover & Waterfall Visualizer
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Live demonstration of the statutory reservation cascade: Divyangjan (PwD) → PVTG → Female ST → Open ST. Unfilled seats in higher priority quotas dynamically spill over to ensure zero unutilized slots for tribal students.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePlayAnimation}
              className="btn btn-primary"
              disabled={isPlaying || loading}
            >
              <Play size={16} /> {isPlaying ? 'Cascading Slots...' : 'Play Live Waterfall'}
            </button>
            <button
              onClick={runSimulation}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Recalculate
            </button>
          </div>
        </div>
      </div>

      {loading || !data ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
          Computing live 4-tier candidate allocations and spillover matrices...
        </div>
      ) : (
        <>
          {/* Waterfall Cascade Graphic */}
          <div className="gov-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
                Interactive Waterfall Cascade State (Step {activeStep} of {data.transitions.length})
              </h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                <span>Total Seats: <strong>{data.totalAvailableSlots}</strong></span>
                <span>Allocated: <strong style={{ color: '#1B7837' }}>{data.totalFilledSlots}</strong></span>
                <span>Spillover Transitions: <strong>{data.transitions.length}</strong></span>
              </div>
            </div>

            {/* 4 Tier Blocks with Flow Connectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', position: 'relative' }}>
              {tiers.map((t, idx) => {
                const summary = data.tierSummary[t.key];
                const isStepActive = activeStep >= idx;
                const receivedSpillover = isStepActive && summary ? summary.spilloverReceived : 0;
                const effectiveQuota = (summary?.originalQuota || t.base) + receivedSpillover;
                const filled = isStepActive && summary ? summary.selectedCount : 0;
                const spilledOut = isStepActive && summary ? summary.spilloverOut : 0;

                return (
                  <div
                    key={t.key}
                    style={{
                      border: `2px solid ${isStepActive ? t.color : '#E2E8F0'}`,
                      borderRadius: '6px',
                      padding: '1.25rem',
                      backgroundColor: isStepActive ? '#FFFFFF' : '#FAFAFA',
                      boxShadow: isStepActive ? '0 4px 8px -2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.4s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Tier {idx + 1}
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', marginBottom: '0.75rem', height: '2.5rem' }}>
                      {summary?.tierName || t.label}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Base Quota:</span>
                        <strong>{summary?.originalQuota || t.base}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Spillover In:</span>
                        <strong style={{ color: receivedSpillover > 0 ? '#1B7837' : '#4A5568' }}>
                          +{receivedSpillover}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Effective Slots:</span>
                        <strong>{effectiveQuota}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Applicants Filled:</span>
                        <strong style={{ color: '#1A4D8F' }}>{filled}</strong>
                      </div>

                      {spilledOut > 0 && isStepActive && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#FFF8E6',
                          border: '1px solid #FCD680',
                          color: '#945B00',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <ArrowRight size={14} /> Cascading {spilledOut} seats to Tier {idx + 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spillover Transition Audit Logs */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.875rem', color: '#0A2540', marginBottom: '0.75rem' }}>
                Algorithmic Spillover Explanations & Policy Trace
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.transitions.map((tr, i) => {
                  const isVisible = activeStep >= tr.step;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '4px',
                        backgroundColor: isVisible ? '#F8FAFC' : '#FAFAFA',
                        border: `1px solid ${isVisible ? '#CBD5E1' : '#E2E8F0'}`,
                        fontSize: '0.8125rem',
                        opacity: isVisible ? 1 : 0.4,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        transition: 'opacity 0.3s ease'
                      }}
                    >
                      <div style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#EBF3FC',
                        color: '#1A4D8F',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        STEP {tr.step}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0A2540' }}>
                          Shifted {tr.slotsShifted} seats from {tr.fromTier} → {tr.toTier}
                        </div>
                        <p style={{ color: '#4A5568', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                          {tr.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sample Candidates Selected via Waterfall Table */}
          <div className="gov-card">
            <div className="gov-card-header">
              <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
                Selected Fellows Cohort Breakdown ({data.allocatedSelections.length} Allocated)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                Showing top merit-ranked scholars
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate Name</th>
                    <th>Original Category</th>
                    <th>Allocated Tier</th>
                    <th>Merit %</th>
                    <th>Spillover Beneficiary?</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allocatedSelections.slice(0, 10).map((cand) => (
                    <tr key={cand.applicationId}>
                      <td><strong>#{cand.meritRank}</strong></td>
                      <td>{cand.name}</td>
                      <td>{cand.originalCategory.replace('_', ' ')}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                          {cand.allocatedTier}
                        </span>
                      </td>
                      <td><strong>{cand.meritScore}%</strong></td>
                      <td>
                        {cand.isSpillover ? (
                          <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                            Yes (Spillover Slot)
                          </span>
                        ) : (
                          <span style={{ color: '#718096', fontSize: '0.75rem' }}>Standard Quota</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
