import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GitFork, ArrowRight, Play, RefreshCw, Banknote, ShieldCheck, AlertCircle } from 'lucide-react';

interface TierData {
  tierName: string;
  originalQuota: number;
  spilloverReceived: number;
  finalQuota: number;
  selectedCount: number;
  spilloverOut: number;
}

interface TierBudgetData {
  tierName: string;
  sanctionedBudget: number;
  unitCost: number;
  budgetReceivedFromSpillover: number;
  effectiveBudget: number;
  committedExpenditure: number;
  budgetSpilledOverOut: number;
  unspentSurplus: number;
}

interface TransitionData {
  step: number;
  fromTier: string;
  toTier: string;
  slotsShifted: number;
  budgetShifted?: number;
  reason: string;
}

export const SpilloverVisualizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dual' | 'slots'>('dual');
  const [data, setData] = useState<{
    totalAvailableSlots: number;
    totalFilledSlots: number;
    unfilledSlots: number;
    totalSanctionedBudget?: number;
    totalCommittedExpenditure?: number;
    totalBudgetSurplus?: number;
    isBudgetConstrained?: boolean;
    tierSummary: Record<string, TierData>;
    tierBudgetSummary?: Record<string, TierBudgetData>;
    transitions: TransitionData[];
    allocatedSelections: any[];
  } | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.runWaterfallSimulation();
      if (resp && resp.success && resp.data) {
        setData(resp.data);
        setActiveStep(resp.data.transitions.length); // Default to full cascade
      } else {
        setError(resp?.message || resp?.error || 'Failed to compute waterfall simulation.');
      }
    } catch (err: any) {
      console.error('Waterfall simulation error:', err);
      setError(err?.message || 'Error executing waterfall simulation.');
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

      {loading ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
          Computing live 4-tier candidate allocations and spillover matrices...
        </div>
      ) : error ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '2.5rem', borderLeft: '4px solid #C53030' }}>
          <div style={{ color: '#C53030', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            Unable to Compute Reservation Waterfall
          </div>
          <p style={{ color: '#4A5568', fontSize: '0.875rem', marginBottom: '1.25rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            {error}
          </p>
          <button onClick={runSimulation} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Retry Calculation
          </button>
        </div>
      ) : data ? (
        <>
          {/* Waterfall Cascade Graphic */}
          <div className="gov-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#0A2540', marginBottom: '0.25rem' }}>
                  Interactive Waterfall Cascade State (Step {activeStep} of {data.transitions.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#718096', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} style={{ color: '#1B7837' }} />
                  Dual-Constraint Algorithm: General Financial Rules (GFR Rule 10 Virement) + Merit Quota
                </span>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '6px', padding: '0.25rem', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('dual')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'dual' ? '#1A4D8F' : 'transparent',
                    color: viewMode === 'dual' ? '#FFFFFF' : '#4A5568'
                  }}
                >
                  Dual-Constraint (Slots + Budget)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('slots')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'slots' ? '#1A4D8F' : 'transparent',
                    color: viewMode === 'slots' ? '#FFFFFF' : '#4A5568'
                  }}
                >
                  Slots Only
                </button>
              </div>
            </div>

            {/* High-Level Dual Metric Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Total Available Seats</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540' }}>{data.totalAvailableSlots} Slots</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Allocated Seats</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1B7837' }}>{data.totalFilledSlots} Filled</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Banknote size={13} style={{ color: '#1A4D8F' }} /> Sanctioned Fiscal Budget
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A4D8F' }}>
                  ₹{((data.totalSanctionedBudget || 363612000) / 10000000).toFixed(2)} Cr
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Committed Expenditure</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7C3AED' }}>
                  ₹{((data.totalCommittedExpenditure || 0) / 10000000).toFixed(2)} Cr
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Fiscal Surplus / Buffer</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0D9488' }}>
                  ₹{((data.totalBudgetSurplus || 0) / 100000).toFixed(1)} L
                </div>
                {data.isBudgetConstrained && (
                  <div style={{ fontSize: '0.6875rem', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <AlertCircle size={11} /> Fiscal ceiling active
                  </div>
                )}
              </div>
            </div>

            {/* 4 Tier Blocks with Flow Connectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', position: 'relative' }}>
              {tiers.map((t, idx) => {
                const summary = data.tierSummary[t.key];
                const bSummary = data.tierBudgetSummary?.[t.key];
                const isStepActive = activeStep >= idx;
                const receivedSpillover = isStepActive && summary ? summary.spilloverReceived : 0;
                const effectiveQuota = (summary?.originalQuota || t.base) + receivedSpillover;
                const filled = isStepActive && summary ? summary.selectedCount : 0;
                const spilledOut = isStepActive && summary ? summary.spilloverOut : 0;
                const committedExp = isStepActive && bSummary ? bSummary.committedExpenditure : 0;
                const spilledBudget = isStepActive && bSummary ? bSummary.budgetSpilledOverOut : 0;

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: t.color, textTransform: 'uppercase' }}>
                        Tier {idx + 1}
                      </span>
                      {bSummary && (
                        <span style={{ fontSize: '0.625rem', backgroundColor: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#475569', fontWeight: 600 }}>
                          ₹{(bSummary.unitCost / 100000).toFixed(2)}L / scholar
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', marginBottom: '0.75rem', minHeight: '2.5rem' }}>
                      {summary?.tierName || t.label}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Base Quota:</span>
                        <strong>{summary?.originalQuota || t.base}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.25rem' }}>
                        <span style={{ color: '#718096' }}>Seat Spillover In:</span>
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

                      {/* Financial Metrics in Dual Mode */}
                      {viewMode === 'dual' && bSummary && (
                        <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Effective Budget:</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>₹{(bSummary.effectiveBudget / 100000).toFixed(1)}L</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Committed Spend:</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED' }}>₹{(committedExp / 100000).toFixed(1)}L</span>
                          </div>
                        </div>
                      )}

                      {spilledOut > 0 && isStepActive && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.4rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#FFF8E6',
                          border: '1px solid #FCD680',
                          color: '#945B00',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <ArrowRight size={14} />
                          <span>
                            {idx < tiers.length - 1
                              ? `Cascading ${spilledOut} seats ${spilledBudget > 0 ? `+ ₹${(spilledBudget / 100000).toFixed(1)}L virement` : ''} to Tier ${idx + 2}`
                              : `Final statutory pool: ${spilledOut} unfilled seats open`}
                          </span>
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
                      <td>{(cand.originalCategory || 'ST').replace('_', ' ')}</td>
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
      ) : null}
    </div>
  );
};
