import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';
import { MeeSevaKioskModal } from '../kiosk/MeeSevaKioskModal';

interface GovHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any | null;
  onOpenLogin: (initialTab?: 'citizen' | 'officer') => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount?: number;
  hasActiveFellowship?: boolean;
  onOpenKioskModal?: () => void;
  isAuthorizedMode?: boolean;
  onToggleAuthorizedMode?: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenNotifications,
  unreadNotifsCount = 0,
  hasActiveFellowship = false,
  onOpenKioskModal,
  isAuthorizedMode = false,
  onToggleAuthorizedMode
}) => {
  const role = currentUser?.role || 'APPLICANT';

  // MeeSeva / CSC Assisted Kiosk modal state
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);

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

      case 'KIOSK_OPERATOR':
        return [
          { id: 'kiosk', label: 'MeeSeva Kiosk Gateway', icon: Building2 },
          { id: 'simulator', label: 'Eligibility Simulator', icon: Sparkles }
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
      case 'KIOSK_OPERATOR': return 'MeeSeva / CSC Authorized VLE Operator';
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

        {/* Right Section: Authentication, Overhauled Switch & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Overhauled Kiosk Button: Interactive Switch to Toggle Authorized Mode ON or OFF */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onToggleAuthorizedMode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                backgroundColor: isAuthorizedMode ? '#DCFCE7' : '#F1F5F9',
                border: `1.5px solid ${isAuthorizedMode ? '#86EFAC' : '#CBD5E1'}`,
                padding: '0.28rem 0.75rem 0.28rem 0.35rem',
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isAuthorizedMode ? '0 0 10px rgba(34, 197, 94, 0.25)' : 'none'
              }}
              title={isAuthorizedMode ? "Authorized Mode Active: Empanelled SWAN Intranet. Click to toggle to Public Internet." : "Unauthorized Mode Active: Public Internet. Click to toggle to Authorized SWAN Intranet."}
            >
              {/* Switch Pill */}
              <div style={{
                width: '38px',
                height: '22px',
                backgroundColor: isAuthorizedMode ? '#16A34A' : '#94A3B8',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.25s ease'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: isAuthorizedMode ? '18px' : '2px',
                  transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isAuthorizedMode ? (
                    <ShieldCheck size={11} style={{ color: '#16A34A' }} />
                  ) : (
                    <Lock size={11} style={{ color: '#64748B' }} />
                  )}
                </div>
              </div>

              {/* Status Text */}
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: isAuthorizedMode ? '#15803D' : '#475569',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span>{isAuthorizedMode ? 'AUTHORIZED MODE' : 'UNAUTHORIZED'}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '10px',
                    backgroundColor: isAuthorizedMode ? '#16A34A' : '#64748B',
                    color: '#FFFFFF'
                  }}>
                    {isAuthorizedMode ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div style={{ fontSize: '0.625rem', color: isAuthorizedMode ? '#166534' : '#64748B' }}>
                  {isAuthorizedMode ? 'MeeSeva SWAN Intranet' : 'Public Internet (Citizen)'}
                </div>
              </div>
            </button>
          </div>

          {!currentUser ? (
            /* Logins based on Authorized Mode */
            !isAuthorizedMode ? (
              /* Unauthorized Mode: ONLY Student Login */
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onOpenLogin('citizen')}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
                  title="Citizen & ST Student Login via Aadhaar OTP"
                >
                  <Lock size={14} />
                  <span>Student Sign In</span>
                </button>
              </div>
            ) : (
              /* Authorized Mode: 2 Logins (Registration and Officer SSO) */
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* 1. Registration Login / Modal Trigger */}
                <button
                  type="button"
                  onClick={() => onOpenKioskModal ? onOpenKioskModal() : setIsKioskModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8125rem',
                    padding: '0.45rem 0.9rem',
                    backgroundColor: '#15803D',
                    borderColor: '#166534'
                  }}
                  title="Launch MeeSeva / CSC Assisted Student Registration Terminal"
                >
                  <Building2 size={14} />
                  <span>Kiosk Registration</span>
                </button>

                {/* 2. Officer SSO (which was previously beside student login) */}
                <button
                  type="button"
                  onClick={() => onOpenLogin('officer')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
                  title="Official Jan Parichay Single Sign-On for Scrutiny & Committee Officers"
                >
                  <ShieldCheck size={14} />
                  <span>Officer SSO</span>
                </button>
              </div>
            )
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

      {/* MeeSeva / CSC Assisted Kiosk Gateway Modal */}
      {!onOpenKioskModal && (
        <MeeSevaKioskModal
          isOpen={isKioskModalOpen}
          onClose={() => setIsKioskModalOpen(false)}
        />
      )}
    </header>
  );
};
