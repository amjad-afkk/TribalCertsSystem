import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart3, Users, RefreshCw, Radio, Truck, AlertOctagon, CheckCircle2, MapPin } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [dispatchingDistrict, setDispatchingDistrict] = useState<string | null>(null);
  const [dispatchedDistricts, setDispatchedDistricts] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await api.getAnalytics();
      if (resp.success) {
        setAnalytics(resp);
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchVan = async (district: string, blocks?: string) => {
    setDispatchingDistrict(district);
    try {
      const resp = await api.dispatchMobileVan({ district, blocks });
      if (resp.success) {
        setDispatchedDistricts(prev => ({
          ...prev,
          [district]: resp.dispatchId
        }));
      }
    } catch (err) {
      console.error('Van dispatch error:', err);
    } finally {
      setDispatchingDistrict(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="gov-card" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
        Aggregating national MoTA analytics, deficiency heatmaps & bottleneck metrics...
      </div>
    );
  }

  const { summary, bottleneckAnalytics, deficiencyHeatmap, inclusionMetrics, districtSaturationRadar } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="gov-card" style={{ borderLeft: '4px solid #1A4D8F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart3 size={22} style={{ color: '#1A4D8F' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540' }}>
                MoTA National Operations & Deficiency Intelligence Dashboard
              </h2>
            </div>
            <p style={{ color: '#4A5568', fontSize: '0.875rem' }}>
              Real-time monitoring across 28 States and 8 UTs. Surfaces state-level scrutiny bottlenecks and document deficiency patterns before applications reach formal rejection.
            </p>
          </div>

          <button onClick={loadData} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="gov-card" style={{ padding: '1.25rem', borderLeft: '3px solid #1A4D8F' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Total Processed Volume</span>
          <h3 style={{ fontSize: '1.5rem', color: '#0A2540', marginTop: '0.25rem' }}>
            {summary.totalApplications.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.6875rem', color: '#1B7837' }}>↑ 18% over AY 2025</span>
        </div>

        <div className="gov-card" style={{ padding: '1.25rem', borderLeft: '3px solid #1B7837' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Total DBT Disbursed (PFMS)</span>
          <h3 style={{ fontSize: '1.5rem', color: '#1B7837', marginTop: '0.25rem' }}>
            {summary.totalDbtDisbursedInr}
          </h3>
          <span style={{ fontSize: '0.6875rem', color: '#718096' }}>100% Aadhaar-Seeded Direct</span>
        </div>

        <div className="gov-card" style={{ padding: '1.25rem', borderLeft: '3px solid #E06D14' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Active Scrutiny Pendency</span>
          <h3 style={{ fontSize: '1.5rem', color: '#E06D14', marginTop: '0.25rem' }}>
            {summary.totalUnderScrutiny.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.6875rem', color: '#718096' }}>Across INO & State Tiers</span>
        </div>

        <div className="gov-card" style={{ padding: '1.25rem', borderLeft: '3px solid #C82333' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Deficiency Loop Submissions</span>
          <h3 style={{ fontSize: '1.5rem', color: '#C82333', marginTop: '0.25rem' }}>
            {summary.totalDeficiencyFlagged.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.6875rem', color: '#176529' }}>82% Resolved Post-Resubmission</span>
        </div>
      </div>

      {/* SECTION: Tribal Saturation GIS Radar & District Saturation Index (DSI) */}
      <div className="gov-card" style={{ borderLeft: '4px solid #0D9488' }}>
        <div className="gov-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Radio size={20} style={{ color: '#0D9488' }} />
              <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0 }}>
                Tribal Saturation GIS Radar (District Saturation Index - DSI Heatmap)
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              Real-time geospatial saturation tracking across Scheduled Areas. Dispatches Mobile CSC Vans to acute Cold Spots (&lt; 35% DSI) before scheme closure.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#CCFBF1', color: '#0F766E', padding: '0.25rem 0.65rem', borderRadius: '4px' }}>
              National Mean DSI: {summary.averageDsiPercent || 55}%
            </span>
          </div>
        </div>

        {/* District Saturation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {(districtSaturationRadar || []).map((d: any) => {
            const isColdSpot = d.status === 'COLD_SPOT';
            const isSaturated = d.status === 'SATURATED';
            const dispatchId = dispatchedDistricts[d.district];

            return (
              <div
                key={d.district}
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  border: `1px solid ${isColdSpot ? '#FECACA' : isSaturated ? '#BBF7D0' : '#E2E8F0'}`,
                  backgroundColor: isColdSpot ? '#FFFBFB' : isSaturated ? '#F0FDF4' : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} style={{ color: isColdSpot ? '#DC2626' : isSaturated ? '#16A34A' : '#1A4D8F' }} />
                      <strong style={{ fontSize: '0.9375rem', color: '#0A2540' }}>{d.district}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({d.state})</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '0.15rem' }}>
                      Tribe: <em>{d.dominantTribe}</em>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: isColdSpot ? '#FDF0ED' : isSaturated ? '#DCFCE7' : '#FEF3C7',
                    color: isColdSpot ? '#B91C1C' : isSaturated ? '#15803D' : '#B45309'
                  }}>
                    {isColdSpot ? 'COLD SPOT' : isSaturated ? 'SATURATED' : 'MODERATE'}
                  </span>
                </div>

                {/* DSI Gauge Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748B' }}>DSI Saturation:</span>
                    <strong style={{ color: isColdSpot ? '#DC2626' : isSaturated ? '#16A34A' : '#0A2540' }}>
                      {d.dsiPercent}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, d.dsiPercent)}%`,
                        height: '100%',
                        backgroundColor: isColdSpot ? '#DC2626' : isSaturated ? '#16A34A' : '#F59E0B',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                    <span>Beneficiaries: {Number(d.actualBeneficiaries).toLocaleString('en-IN')}</span>
                    <span>Census Base: {Number(d.eligibleStStudents).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Policy Recommendation & Action */}
                <div style={{
                  fontSize: '0.75rem',
                  color: isColdSpot ? '#991B1B' : '#334155',
                  backgroundColor: isColdSpot ? '#FEF2F2' : '#F8FAFC',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '4px',
                  lineHeight: 1.4
                }}>
                  {isColdSpot && <AlertOctagon size={13} style={{ display: 'inline', marginRight: '0.3rem', color: '#DC2626', verticalAlign: '-2px' }} />}
                  {d.recommendedAction}
                </div>

                {/* 1-Click Mobile CSC Van Dispatch Button for Cold Spots */}
                {isColdSpot && (
                  <div>
                    {dispatchId ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#166534',
                        backgroundColor: '#DCFCE7',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
                        Mobile CSC Van Dispatched ({dispatchId})
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDispatchVan(d.district)}
                        disabled={dispatchingDistrict === d.district}
                        className="btn btn-primary btn-sm"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          backgroundColor: '#B91C1C',
                          borderColor: '#B91C1C',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.75rem'
                        }}
                      >
                        <Truck size={14} />
                        {dispatchingDistrict === d.district ? 'Dispatching Field Unit...' : 'Dispatch Mobile CSC Outreach Van'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
        {/* Bottleneck Detection Table (Section 5.5) */}
        <div className="gov-card" style={{ minWidth: 0 }}>
          <div className="gov-card-header">
            <div>
              <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
                State-Level Scrutiny Bottleneck Radar
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                Monitors Average Days in Verification across Nodal Centers
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Avg Days</th>
                  <th>Pending Queue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bottleneckAnalytics.map((st: any) => {
                  const isHigh = st.bottleneckStatus === 'BOTTLENECK_HIGH';
                  const isModerate = st.bottleneckStatus === 'MODERATE_DELAY';

                  return (
                    <tr key={st.state} style={{ backgroundColor: isHigh ? '#FFF5F5' : 'transparent' }}>
                      <td><strong>{st.state}</strong></td>
                      <td>
                        <strong style={{ color: isHigh ? '#A61C1C' : '#0A2540' }}>
                          {st.avgDaysInScrutiny} days
                        </strong>
                      </td>
                      <td>{st.pendingVolume} apps</td>
                      <td>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: isHigh ? '#FDF0ED' : isModerate ? '#FFF8E6' : '#EAF7EE',
                          color: isHigh ? '#A61C1C' : isModerate ? '#945B00' : '#176529'
                        }}>
                          {st.bottleneckStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deficiency Heatmap (Section 6.2) */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h3 style={{ fontSize: '1rem', color: '#0A2540' }}>
                Proactive Deficiency Heatmap & Rejection Vectors
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                AI analyzes high-frequency document rejection reasons by region
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deficiencyHeatmap.map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '0.875rem',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: item.flagRatePercent > 20 ? '#FFF5F5' : '#F8FAFC'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#0A2540' }}>{item.state}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '0.5rem' }}>
                      Doc: <strong>{item.docType}</strong>
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: item.flagRatePercent > 20 ? '#A61C1C' : '#945B00'
                  }}>
                    {item.flagRatePercent}% Flag Rate
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#4A5568', lineHeight: 1.4 }}>
                  {item.primaryReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PVTG & Inclusion Metrics Card */}
      <div className="gov-card" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="gov-card-header">
          <h3 style={{ fontSize: '1rem', color: '#0A2540', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: '#1A4D8F' }} />
            Vulnerable Tribal Groups & Female ST Inclusion Indices
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.6875rem', color: '#718096' }}>PVTG Applications</div>
            <strong style={{ fontSize: '1.25rem', color: '#0A2540' }}>{inclusionMetrics.pvtgApplications}</strong>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.6875rem', color: '#718096' }}>PVTG Selection Rate</div>
            <strong style={{ fontSize: '1.25rem', color: '#1B7837' }}>{inclusionMetrics.pvtgSelectionRate}</strong>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.6875rem', color: '#718096' }}>Divyangjan (PwD) Rate</div>
            <strong style={{ fontSize: '1.25rem', color: '#1B7837' }}>{inclusionMetrics.divyangjanSelectionRate}</strong>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.6875rem', color: '#718096' }}>Female ST Representation</div>
            <strong style={{ fontSize: '1.25rem', color: '#1A4D8F' }}>{inclusionMetrics.femaleStRepresentation}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
