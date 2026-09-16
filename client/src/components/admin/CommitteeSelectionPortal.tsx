import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, Globe, Award, DollarSign, ShieldCheck, RefreshCw, Check } from 'lucide-react';

export const CommitteeSelectionPortal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [nosData, setNosData] = useState<any | null>(null);
  const [signedOffMap, setSignedOffMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadNosData = async () => {
    setLoading(true);
    try {
      const resp = await api.runNosSelection();
      if (resp.success) {
        setNosData(resp.data);
      }
    } catch (err) {
      console.error('Failed to load NOS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNosData();
  }, []);

  const handleSignOff = async (appId: string, candName: string) => {
    setActionLoading(appId);
    try {
      const resp = await api.signOffSelection({
        applicationId: appId,
        committeeMember: 'Prof. S. R. Marandi (Selection Committee Chair)',
        comments: `Formal Selection Committee Award Confirmed for ${candName}. Priority Tier and Forex Entitlement Approved.`
      });
      if (resp.success) {
        setSignedOffMap(prev => ({ ...prev, [appId]: true }));
      }
    } catch (err) {
      console.error('Sign-off error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Award size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                National Selection Committee — Human-in-the-Loop Sign-Off
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Statutory final approval portal for National Overseas Scholarship (NOS) & NFST Fellowships. Candidate credentials are auto-tagged against QS World Rankings (Top 1000) and live forex maintenance allowances.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info">
              <ShieldCheck size={12} /> Committee Quorum Active
            </span>
            <button onClick={loadNosData} className="btn btn-secondary">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading || !nosData ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
          Calculating live QS World Ranking priority tiers & foreign exchange disbursements...
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="gov-card" style={{ padding: '1rem', borderLeft: '3px solid #1A4D8F' }}>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>Total NOS Annual Slots</span>
              <h3 style={{ fontSize: '1.5rem', color: '#0A2540', marginTop: '0.25rem' }}>
                {nosData.totalSlots} Slots
              </h3>
            </div>

            <div className="gov-card" style={{ padding: '1rem', borderLeft: '3px solid #1B7837' }}>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>Priority Tier 1 (QS Top 1000 Admits)</span>
              <h3 style={{ fontSize: '1.5rem', color: '#1B7837', marginTop: '0.25rem' }}>
                {nosData.tier1Selected} Scholars
              </h3>
            </div>

            <div className="gov-card" style={{ padding: '1rem', borderLeft: '3px solid #E06D14' }}>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>Priority Tier 2 (Conditional Offers)</span>
              <h3 style={{ fontSize: '1.5rem', color: '#E06D14', marginTop: '0.25rem' }}>
                {nosData.tier2Selected} Scholars
              </h3>
            </div>

            <div className="gov-card" style={{ padding: '1rem', borderLeft: '3px solid #0A2540' }}>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>Forex Annual Outlay (Est.)</span>
              <h3 style={{ fontSize: '1.375rem', color: '#0A2540', marginTop: '0.25rem' }}>
                ₹4.85 Crores
              </h3>
            </div>
          </div>

          {/* Ranked Shortlist with Live Forex Calculations */}
          <div className="gov-card">
            <div className="gov-card-header">
              <div>
                <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
                  NOS Candidate Shortlist Annotated by AI Committee Assistant
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                  Sorted strictly by Priority Tier → QS World Ranking → Academic Merit Score
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {nosData.selections.map((cand: any) => {
                const isSignedOff = signedOffMap[cand.applicationId];
                const forex = cand.forexDetails;

                return (
                  <div
                    key={cand.applicationId}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      backgroundColor: cand.priorityTier === 1 ? '#F0FDF4' : '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    <div style={{ flex: '1 1 340px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: cand.priorityTier === 1 ? '#DCFCE7' : '#FEF3C7',
                          color: cand.priorityTier === 1 ? '#15803D' : '#B45309'
                        }}>
                          Priority Tier {cand.priorityTier}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                          Merit Rank: <strong>#{cand.meritRank}</strong>
                        </span>

                        <span style={{ fontSize: '0.75rem', color: '#1A4D8F', fontWeight: 600 }}>
                          {cand.discipline}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.125rem', color: '#0A2540', marginBottom: '0.25rem' }}>
                        {cand.name}
                      </h4>

                      <div style={{ fontSize: '0.8125rem', color: '#4A5568', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Globe size={14} style={{ color: '#1A4D8F' }} />
                        <span>{cand.university}</span>
                        {cand.qsRank && (
                          <span style={{ fontWeight: 600, color: '#1A4D8F', backgroundColor: '#EBF3FC', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.6875rem' }}>
                            QS Rank #{cand.qsRank}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.35rem' }}>
                        Category: <strong>{cand.category.replace('_', ' ')}</strong> • Qualifying Merit: <strong>{cand.meritScore}%</strong>
                      </div>
                    </div>

                    {/* Forex Breakdown Card */}
                    {forex && (
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.75rem',
                        flex: '1 1 240px'
                      }}>
                        <div style={{ fontWeight: 600, color: '#0A2540', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <DollarSign size={14} style={{ color: '#1B7837' }} /> Forex Entitlement Breakdown:
                        </div>
                        <div style={{ color: '#4A5568', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div>Maintenance: <strong>{forex.currency} {forex.annualMaintenanceForex.toLocaleString()} / yr</strong></div>
                          <div>Contingency & Equipment: <strong>{forex.currency} {(forex.contingencyAllowanceForex + forex.equipmentAllowanceForex).toLocaleString()}</strong></div>
                          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.25rem', marginTop: '0.25rem', color: '#0A2540', fontWeight: 600 }}>
                            Total INR Equivalent: ₹{forex.totalAnnualDisbursementInr.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Committee Sign-Off Button */}
                    <div>
                      {isSignedOff ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <CheckCircle2 size={18} style={{ color: '#16A34A' }} /> Committee Signed Off
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignOff(cand.applicationId, cand.name)}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === cand.applicationId}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          <Check size={14} />
                          {actionLoading === cand.applicationId ? 'Recording Sign-off...' : 'Sign Off & Approve Award'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
