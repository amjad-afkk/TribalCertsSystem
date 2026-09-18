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
  Lock
} from 'lucide-react';

const ROLE_DISPLAY_TAG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  'applicant-pooja': { label: 'Citizen (PVTG)', bg: '#EBF3FC', color: '#1A4D8F', border: '#BCD4F0' },
  'applicant-amitabh': { label: 'Citizen (ST)', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  'applicant-sunita': { label: 'Citizen (NOS)', bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
  'ino-officer': { label: 'Tier-1 INO', bg: '#CCFBF1', color: '#0F766E', border: '#99F6E4' },
  'state-nodal': { label: 'Tier-2 SNO', bg: '#FFEDD5', color: '#9A3412', border: '#FED7AA' },
  'committee-member': { label: 'Selection Comm.', bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' },
  'mota-admin': { label: 'Super Admin', bg: '#FEF9C3', color: '#854D0E', border: '#FEF08A' }
};

interface GovHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
}


export const GovHeader: React.FC<GovHeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole
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
    { id: 'simulator', label: 'Scholarship Twin (Simulator)', icon: Sparkles, desc: 'Rule-based multi-scheme eligibility check' }
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

        {/* Role Switcher with RBAC Clearance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {ROLE_DISPLAY_TAG[currentRole] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.6875rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
                Clearance
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: ROLE_DISPLAY_TAG[currentRole].bg,
                  color: ROLE_DISPLAY_TAG[currentRole].color,
                  border: `1px solid ${ROLE_DISPLAY_TAG[currentRole].border}`,
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {currentRole.startsWith('applicant-') ? <UserCheck size={13} /> : <ShieldCheck size={13} />}
                {ROLE_DISPLAY_TAG[currentRole].label}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.6875rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Persona / Role
            </span>
            <select
              className="form-select"
              style={{
                fontSize: '0.8125rem',
                padding: '0.4rem 0.65rem',
                fontWeight: 600,
                borderColor: '#CBD5E1',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                color: '#0A2540',
                cursor: 'pointer'
              }}
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            >
              <optgroup label="Citizen / Applicant Personas">
                <option value="applicant-pooja">Pooja Maravi (PVTG • Ph.D NFST)</option>
                <option value="applicant-amitabh">Amitabh Gond (Deficiency Demo • Income Cap)</option>
                <option value="applicant-sunita">Sunita Soren (NOS • Oxford QS #3)</option>
              </optgroup>
              <optgroup label="Government Officers & Scrutiny">
                <option value="ino-officer">Institute Nodal Officer (INO - Tier 1)</option>
                <option value="state-nodal">State Nodal Officer (SNO - Tier 2)</option>
                <option value="committee-member">National Selection Committee (Sign-off)</option>
                <option value="mota-admin">MoTA Super Administrator</option>
              </optgroup>
            </select>
          </div>
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
                {currentRole.startsWith('applicant-') && (
                  <Lock size={11} style={{ opacity: 0.75, marginLeft: '0.15rem' }} />
                )}
                <ChevronDown size={14} style={{ transform: openDropdown === 'scrutiny' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openDropdown === 'scrutiny' && (
                <div className="nav-dropdown-menu" style={{ minWidth: '310px' }}>
                  {scrutinyTabs.map(t => {
                    const Icon = t.icon;
                    const isActive = currentTab === t.id;
                    const isRestrictedForApplicant = currentRole.startsWith('applicant-') && t.id !== 'waterfall';
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
                {currentRole.startsWith('applicant-') && (
                  <Lock size={11} style={{ opacity: 0.75, marginLeft: '0.15rem' }} />
                )}
                <ChevronDown size={14} style={{ transform: openDropdown === 'admin' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openDropdown === 'admin' && (
                <div className="nav-dropdown-menu" style={{ minWidth: '300px' }}>
                  {adminTabs.map(t => {
                    const Icon = t.icon;
                    const isActive = currentTab === t.id;
                    const isRestricted = currentRole.startsWith('applicant-');
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
