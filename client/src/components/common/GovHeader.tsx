import React from 'react';
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
  LogOut
} from 'lucide-react';

interface GovHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any | null;
  onOpenLogin: (initialTab?: 'citizen' | 'officer') => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount?: number;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenNotifications,
  unreadNotifsCount = 0
}) => {
  const role = currentUser?.role || 'APPLICANT';

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
      default:
        return [
          { id: 'applicant', label: 'My Applications', icon: UserCheck },
          { id: 'simulator', label: 'Eligibility Simulator', icon: Sparkles },
          { id: 'fellowship', label: 'Fellowship Lifecycle (NFST)', icon: Award }
        ];
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
    </header>
  );
};
