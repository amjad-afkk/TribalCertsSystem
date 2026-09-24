import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  Sliders,
  BarChart3,
  GitFork,
  CheckCircle2,
  Lock,
  Bell,
  Award,
  LogOut,
  Wifi,
  WifiOff,
  UploadCloud,
  Trash2,
  X
} from 'lucide-react';
import { offlineQueueService, type OfflineApplication } from '../../services/offlineQueue';
import { api } from '../../services/api';

interface GovHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any | null;
  onOpenLogin: (initialTab?: 'citizen' | 'officer') => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount?: number;
  hasActiveFellowship?: boolean;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenNotifications,
  unreadNotifsCount = 0,
  hasActiveFellowship = false
}) => {
  const role = currentUser?.role || 'APPLICANT';

  // Offline queue state for Ashram schools
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineApplication[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const refreshQueue = () => {
    setOfflineQueue(offlineQueueService.getQueue());
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const handleSeedApp = () => {
    offlineQueueService.seedSampleApp();
    refreshQueue();
  };

  const handleSyncBatch = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const resp = await api.batchSyncApplications({
        ashramSchoolCode: offlineQueue[0]?.ashramSchoolCode || 'EMRS-ASHRAM-PWA',
        applications: offlineQueue
      });
      if (resp.success) {
        offlineQueueService.clear();
        refreshQueue();
        setSyncSuccessMsg(`Batch ${resp.batchId} cryptographically ingested: ${resp.syncedCount} applications synced to MoTA Central.`);
      }
    } catch (err: any) {
      console.error('Batch sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute tabs strictly filtered by the active user's authorized role
  const getNavTabs = () => {
    if (!currentUser) {
      return [
        { id: 'login', label: 'Portal Gateway / Sign In', icon: Lock },
        { id: 'simulator', label: 'Eligibility Simulator (Public)', icon: Sparkles }
      ];
    }

    switch (role) {
      case 'INO':
        return [
          { id: 'verification', label: 'Institute Verification Queue', icon: ShieldCheck }
        ];

      case 'STATE_NODAL':
        return [
          { id: 'verification', label: 'State Scrutiny Queue', icon: ShieldCheck },
          { id: 'analytics', label: 'State Operations Radar', icon: BarChart3 }
        ];

      case 'COMMITTEE':
        return [
          { id: 'committee', label: 'Selection Committee Portal', icon: CheckCircle2 },
          { id: 'waterfall', label: 'Spillover Waterfall Visualizer', icon: GitFork }
        ];

      case 'MOTA_ADMIN':
        return [
          { id: 'analytics', label: 'National Analytics Radar', icon: BarChart3 },
          { id: 'scheme-config', label: 'Scheme Policy Configurator', icon: Sliders },
          { id: 'verification', label: 'Verification Queue', icon: ShieldCheck },
          { id: 'committee', label: 'Committee Sign-Off', icon: CheckCircle2 },
          { id: 'waterfall', label: 'Spillover Waterfall Visualizer', icon: GitFork }
        ];

      case 'APPLICANT':
      default: {
        const tabs = [
          { id: 'applicant', label: 'My Applications', icon: UserCheck },
          { id: 'simulator', label: 'Eligibility Simulator', icon: Sparkles }
        ];
        if (hasActiveFellowship) {
          tabs.push({ id: 'fellowship', label: 'Fellowship Lifecycle (NFST)', icon: Award });
        }
        return tabs;
      }
    }
  };

  const navTabs = getNavTabs();

  // Helper for role badge display
  const getRoleLabel = () => {
    if (!currentUser) return 'Public Guest';
    switch (currentUser.role) {
      case 'INO': return 'Institute Nodal Officer (Tier 1)';
      case 'STATE_NODAL': return 'State Nodal Officer (Tier 2)';
      case 'COMMITTEE': return 'Selection Committee Chair';
      case 'MOTA_ADMIN': return 'Ministry Super Administrator';
      case 'APPLICANT':
      default:
        return currentUser.designationTitle || 'Citizen / ST Scholar';
    }
  };

  return (
    <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* National Tricolor Top Strip */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #E06D14 0%, #E06D14 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #1B7837 66.6%, #1B7837 100%)'
        }}
      />

      {/* Main Branding & Account Row */}
      <div className="container" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Emblem & Portal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              lineHeight: 1.1,
              letterSpacing: '0.05em'
            }}
          >
            <span>MoTA</span>
            <span style={{ fontSize: '0.55rem', color: '#E06D14' }}>GOI</span>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', fontWeight: 600 }}>
              Ministry of Tribal Affairs • Government of India
            </div>
            <h1 style={{ fontSize: '1.125rem', color: '#0A2540', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              National Tribal Scholarship & Fellowship Portal
            </h1>
          </div>
        </div>

        {/* Right Section: Authentication & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Ashram School Mesh Sync Badge */}
          <button
            type="button"
            onClick={() => {
              refreshQueue();
              setIsOfflineModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: offlineQueue.length > 0 ? '#FEF3C7' : '#F0FDF4',
              color: offlineQueue.length > 0 ? '#92400E' : '#166534',
              border: `1px solid ${offlineQueue.length > 0 ? '#FCD34D' : '#BBF7D0'}`
            }}
            title="Ashram School Offline Queue & Mesh Sync"
          >
            {offlineQueue.length > 0 ? <WifiOff size={13} style={{ color: '#D97706' }} /> : <Wifi size={13} style={{ color: '#16A34A' }} />}
            <span>{offlineQueue.length > 0 ? `${offlineQueue.length} Offline Queued` : 'Ashram Sync Online'}</span>
          </button>

          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenLogin('citizen')}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
              >
                <Lock size={14} />
                <span>Citizen Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('officer')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              >
                <ShieldCheck size={14} />
                <span>Officer SSO</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Notification Bell */}
              <button
                type="button"
                onClick={onOpenNotifications}
                className="btn btn-secondary btn-sm"
                style={{ position: 'relative', padding: '0.45rem', borderRadius: '50%', color: '#1A4D8F' }}
                title="View SMS & WhatsApp Alerts"
              >
                <Bell size={16} />
                {(unreadNotifsCount ?? 0) > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: '#E06D14',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Clean User Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#F8FAFC',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF3FC',
                  color: '#1A4D8F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'GO'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A2540', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{currentUser.name}</span>
                    {currentUser.isKycVerified && (
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <CheckCircle2 size={8} /> e-KYC
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                    {getRoleLabel()}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', color: '#A61C1C', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                title="Sign Out"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clean, Simple Role-Tailored Navigation Bar */}
      <nav style={{ backgroundColor: '#0A2540', borderTop: '1px solid #1E3A5F' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', padding: '0 1.25rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #E06D14' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#CBD5E1';
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#FFFFFF' : '#94A3B8' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MODAL: Ashram School Offline Mesh Sync */}
      {isOfflineModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gov-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <WifiOff size={18} style={{ color: '#E06D14' }} />
                  <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0 }}>
                    Ashram School Offline-First Mesh Batch Sync (EMRS)
                  </h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                  Enables teachers and nodal volunteers in remote Schedule V areas to record applications offline. Automatically buffers to client storage with cryptographic SHA-256 seal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {syncSuccessMsg && (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Offline Queue Summary */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              padding: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Locally Buffered Applications</div>
                <strong style={{ fontSize: '1.25rem', color: '#0A2540' }}>{offlineQueue.length} Applications Queued</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSeedApp}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Sparkles size={12} style={{ color: '#E06D14' }} /> + Simulate Offline App
                </button>
                {offlineQueue.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      offlineQueueService.clear();
                      refreshQueue();
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', color: '#B91C1C' }}
                    title="Clear offline storage"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Application List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {offlineQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                  No offline applications buffered. Click "+ Simulate Offline App" to generate a sample offline tribal intake record.
                </div>
              ) : (
                offlineQueue.map((item, idx) => (
                  <div
                    key={item.localId}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8125rem', color: '#0A2540' }}>
                        #{idx + 1} {item.studentName} ({item.standard})
                      </strong>
                      <span style={{ fontSize: '0.6875rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                        BUFFERED LOCAL
                      </span>
                    </div>

                    <div style={{ color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span>School: <strong>{item.ashramSchoolCode}</strong></span>
                      <span>Marks: <strong>{item.academicPercentage}%</strong></span>
                      <span>Income: <strong>₹{item.claimedIncome.toLocaleString('en-IN')}</strong></span>
                    </div>

                    <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: '#64748B' }}>
                      Seal: {item.localSha256Hash} • Queued: {new Date(item.queuedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSyncBatch}
                disabled={isSyncing || offlineQueue.length === 0}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UploadCloud size={15} />
                {isSyncing ? 'Ingesting Batch...' : `Batch Sync to MoTA Central (${offlineQueue.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
