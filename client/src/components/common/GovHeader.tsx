import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  Sliders,
  BarChart3,
  GitFork,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Lock,
  Bell,
  Award
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setOpenDropdown(null);
    setIsDrawerOpen(false);
  };

  const studentTabs = [
    { id: 'applicant', label: 'Applicant Dashboard', icon: UserCheck, desc: 'Track submitted applications, documents, & DBT' },
    { id: 'simulator', label: 'Scholarship Twin (Simulator)', icon: Sparkles, desc: 'Rule-based multi-scheme eligibility check' },
    { id: 'fellowship', label: 'Fellowship Lifecycle (NFST/NOS)', icon: Award, desc: '30-day joining, continuation reports, & thesis repository' }
  ];

  const scrutinyTabs = [
    { id: 'verification', label: 'Nodal Scrutiny Queue', icon: ShieldCheck, desc: 'Document verification & AI discrepancy review' },
    { id: 'committee', label: 'Selection Committee (NOS/NFST)', icon: CheckCircle2, desc: 'Merit list approval & committee sign-off' },
    { id: 'waterfall', label: 'Spillover Visualizer (Waterfall)', icon: GitFork, desc: 'NFST 4-tier statutory quota cascade' }
  ];

  const adminTabs = [
    { id: 'analytics', label: 'MoTA Analytics & Heatmap', icon: BarChart3, desc: 'Real-time disbursement & state metrics' },
    { id: 'scheme-config', label: 'No-Code Scheme Configurator', icon: Sliders, desc: 'Configure eligibility rules & quotas' }
  ];

  const isStudentActive = studentTabs.some(t => t.id === currentTab);
  const isScrutinyActive = scrutinyTabs.some(t => t.id === currentTab);
  const isAdminActive = adminTabs.some(t => t.id === currentTab);

  const getTabLabel = (tabId: string) => {
    const all = [...studentTabs, ...scrutinyTabs, ...adminTabs];
    return all.find(t => t.id === tabId)?.label || 'Portal';
  };

  return (
    <header style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', position: 'relative', zIndex: 100 }}>
      {/* Top National Tricolor Strip */}
      <div
        style={{
          height: '4px',
          background: 'linear-gradient(90deg, #E06D14 0%, #E06D14 33%, #FFFFFF 33%, #FFFFFF 66%, #1B7837 66%, #1B7837 100%)'
        }}
      />

      {/* Main Branding Bar */}
      <div className="container" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Emblem Simulation */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '6px',
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '0.05em',
              boxShadow: '0 2px 4px rgba(10,37,64,0.15)'
            }}
          >
            MoTA<br />
            <span style={{ fontSize: '0.625rem', color: '#E06D14' }}>GOI</span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A5568', fontWeight: 600 }}>
              Ministry of Tribal Affairs • Government of India
            </div>
            <div style={{ fontSize: '1.2rem', color: '#0A2540', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>National Tribal Scholarship & Fellowship Portal</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: '#EBF3FC',
                  color: '#1A4D8F',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #BCD4F0'
                }}
              >
                SIH 2026 Edition
              </span>
            </div>
          </div>
        </div>

        {/* Authentication & User Session Management (Replaces dropdown) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenLogin('citizen')}
                className="btn btn-primary"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                }}
              >
                <Lock size={15} />
                <span>Sign In / Register</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('officer')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.5rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ShieldCheck size={14} />
                <span>Officer SSO</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Notification Bell with Badge */}
              <button
                type="button"
                onClick={onOpenNotifications}
                className="btn btn-secondary btn-sm"
                style={{ position: 'relative', padding: '0.45rem', borderRadius: '50%' }}
                title="View SMS & WhatsApp Alerts"
              >
                <Bell size={16} style={{ color: '#1A4D8F' }} />
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

              {/* Logged in Identity Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#F8FAFC',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF3FC',
                  color: '#1A4D8F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}>
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'GO'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0A2540', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{currentUser.name}</span>
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
                      <CheckCircle2 size={9} /> e-KYC
                    </span>
                  </div>

                  <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                    {currentUser.designationTitle || (currentUser.role === 'APPLICANT' ? 'Citizen (Aadhaar Verified)' : currentUser.role)}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', color: '#A61C1C' }}
                title="Sign Out of Session"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar with Dropdowns & Burgers */}
      <nav style={{ backgroundColor: '#0A2540', color: '#FFFFFF' }}>
        <div
          className="container"
          ref={dropdownRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem'
          }}
        >
          {/* Left: Burger Button + Category Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
            {/* Burger Menu Button ("Burgers") */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="burger-btn"
              title="Open Navigation Menu"
              aria-label="Navigation Menu"
              style={{ marginRight: '0.5rem' }}
            >
              <Menu size={18} />
            </button>

            {/* Dropdown 1: Student Services */}
            <div className="nav-dropdown-wrapper">
              <button
                className={`nav-dropdown-trigger ${isStudentActive ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'student' ? null : 'student')}
              >
                <GraduationCap size={15} />
                <span>Student Services</span>
                <ChevronDown size={14} style={{ transform: openDropdown === 'student' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openDropdown === 'student' && (
                <div className="nav-dropdown-menu">
                  {studentTabs.map(t => {
                    const Icon = t.icon;
                    const isActive = currentTab === t.id;
                    return (
                      <button
                        key={t.id}
                        className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectTab(t.id)}
                      >
                        <Icon size={16} />
                        <div>
                          <div>{t.label}</div>
                          <span className="nav-dropdown-item-desc">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 2: Scrutiny & Waterfall */}
            <div className="nav-dropdown-wrapper">
              <button
                className={`nav-dropdown-trigger ${isScrutinyActive ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'scrutiny' ? null : 'scrutiny')}
              >
                <ShieldCheck size={15} />
                <span>Scrutiny & Selection</span>
                {(!currentUser || currentUser.role === 'APPLICANT') && (
                  <Lock size={11} style={{ opacity: 0.75, marginLeft: '0.15rem' }} />
                )}
                <ChevronDown size={14} style={{ transform: openDropdown === 'scrutiny' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openDropdown === 'scrutiny' && (
                <div className="nav-dropdown-menu" style={{ minWidth: '310px' }}>
                  {scrutinyTabs.map(t => {
                    const Icon = t.icon;
                    const isActive = currentTab === t.id;
                    const isRestrictedForApplicant = (!currentUser || currentUser.role === 'APPLICANT') && t.id !== 'waterfall';
                    return (
                      <button
                        key={t.id}
                        className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectTab(t.id)}
                      >
                        <Icon size={16} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t.label}</span>
                            {isRestrictedForApplicant && (
                              <span style={{ fontSize: '0.625rem', color: '#EF4444', backgroundColor: '#FEE2E2', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Lock size={9} /> Officer
                              </span>
                            )}
                          </div>
                          <span className="nav-dropdown-item-desc">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 3: Administration */}
            <div className="nav-dropdown-wrapper">
              <button
                className={`nav-dropdown-trigger ${isAdminActive ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'admin' ? null : 'admin')}
              >
                <BarChart3 size={15} />
                <span>Ministry Governance</span>
                {(!currentUser || currentUser.role === 'APPLICANT') && (
                  <Lock size={11} style={{ opacity: 0.75, marginLeft: '0.15rem' }} />
                )}
                <ChevronDown size={14} style={{ transform: openDropdown === 'admin' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openDropdown === 'admin' && (
                <div className="nav-dropdown-menu" style={{ minWidth: '300px' }}>
                  {adminTabs.map(t => {
                    const Icon = t.icon;
                    const isActive = currentTab === t.id;
                    const isRestricted = !currentUser || currentUser.role === 'APPLICANT';
                    return (
                      <button
                        key={t.id}
                        className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectTab(t.id)}
                      >
                        <Icon size={16} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t.label}</span>
                            {isRestricted && (
                              <span style={{ fontSize: '0.625rem', color: '#EF4444', backgroundColor: '#FEE2E2', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Lock size={9} /> {t.id === 'scheme-config' ? 'Admin' : 'Officer'}
                              </span>
                            )}
                          </div>
                          <span className="nav-dropdown-item-desc">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Tab Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current View:
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {getTabLabel(currentTab)}
            </span>
          </div>
        </div>
      </nav>

      {/* Slide-Out Drawer ("Burger Menu Panel") */}
      {isDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />
          <div className="drawer-panel">
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#E06D14', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                  GOI
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>MoTA Unified Portal</div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Navigation Index</div>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Services Section */}
            <div className="drawer-section-title">Student & Citizen Services</div>
            {studentTabs.map(t => {
              const Icon = t.icon;
              const isActive = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  className={`drawer-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(t.id)}
                >
                  <Icon size={18} />
                  <div>
                    <div>{t.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}

            {/* Scrutiny Section */}
            <div className="drawer-section-title">Scrutiny & Selection Governance</div>
            {scrutinyTabs.map(t => {
              const Icon = t.icon;
              const isActive = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  className={`drawer-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(t.id)}
                >
                  <Icon size={18} />
                  <div>
                    <div>{t.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}

            {/* Administration Section */}
            <div className="drawer-section-title">Ministry Administration</div>
            {adminTabs.map(t => {
              const Icon = t.icon;
              const isActive = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  className={`drawer-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(t.id)}
                >
                  <Icon size={18} />
                  <div>
                    <div>{t.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}

            {/* Official External Links */}
            <div className="drawer-section-title" style={{ marginTop: 'auto' }}>Official Resources</div>
            <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
              <a
                href="https://tribal.nic.in"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#1A4D8F',
                  textDecoration: 'none',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}
              >
                <span>tribal.nic.in (Official Ministry)</span>
                <ExternalLink size={12} />
              </a>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                Unified National Scholarship System v1.0 • Smart India Hackathon
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
