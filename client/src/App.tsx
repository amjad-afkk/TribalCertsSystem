import React, { useState, useEffect } from 'react';
import { GovHeader } from './components/common/GovHeader';
import { GovFooter } from './components/common/GovFooter';
import { ApplicantPortal } from './components/applicant/ApplicantPortal';
import { ScholarshipTwin } from './components/simulator/ScholarshipTwin';
import { SpilloverVisualizer } from './components/visualizer/SpilloverVisualizer';
import { VerificationQueue } from './components/admin/VerificationQueue';
import { CommitteeSelectionPortal } from './components/admin/CommitteeSelectionPortal';
import { AdminAnalytics } from './components/analytics/AdminAnalytics';
import { SchemeConfigurator } from './components/admin/SchemeConfigurator';
import { DynamicApplicationForm } from './components/applicant/DynamicApplicationForm';
import { RegionalChatbot } from './components/chatbot/RegionalChatbot';
import { RoleGuard } from './components/common/RoleGuard';
import { AuthModal, type AuthenticatedUser } from './components/auth/AuthModal';
import { LandingLoginPage } from './components/auth/LandingLoginPage';
import { NotificationModal } from './components/common/NotificationModal';
import { FellowshipPortal } from './components/fellowship/FellowshipPortal';
import { MeeSevaKioskModal } from './components/kiosk/MeeSevaKioskModal';
import { Building2 } from 'lucide-react';
import { api, setApiRole } from './services/api';
import type { Applicant } from './types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '2rem auto', backgroundColor: '#FDF0ED', border: '1px solid #F7B8B8', borderRadius: '8px' }}>
          <h2 style={{ color: '#A61C1C', marginBottom: '0.75rem' }}>Application Render Issue Detected</h2>
          <p style={{ color: '#742A2A', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="btn btn-primary btn-sm"
          >
            Reload Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [currentRole, setCurrentRole] = useState<string>('guest');
  
  // Government Authentication & SSO Session State (null by default for clean, secure entry gateway)
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'citizen' | 'officer'>('citizen');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [defaultApplySchemeCode, setDefaultApplySchemeCode] = useState<string | undefined>(undefined);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [hasActiveFellowship, setHasActiveFellowship] = useState<boolean>(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState<boolean>(false);

  // Synchronize active role with API client for RBAC headers
  useEffect(() => {
    if (currentUser) {
      setApiRole(currentUser.role);
    } else {
      setApiRole('guest');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const resp = await api.getNotifications(currentUser?.id || 'app-user-01');
        if (resp.success && Array.isArray(resp.data)) {
          const unread = resp.data.filter((n: any) => !n.isRead).length;
          setUnreadNotifsCount(unread);
        }
      } catch (e) {
        console.error('Error fetching unread count:', e);
      }
    };
    if (currentUser) {
      fetchUnread();
      // Refresh notification badge every 30 seconds while logged in
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadNotifsCount(0);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const resp = await api.getApplicants();
        if (resp.success) {
          setApplicants(resp.data);
        }
      } catch (err) {
        console.error('Failed to fetch applicants:', err);
      }
    };
    fetchApplicants();
  }, []);

  // Check if current applicant has an active fellowship record (NFST)
  useEffect(() => {
    const checkFellowship = async () => {
      if (!currentUser || currentUser.role !== 'APPLICANT') {
        setHasActiveFellowship(false);
        return;
      }
      try {
        const resp = await api.getFellowshipRecord(currentUser.id);
        setHasActiveFellowship(resp.success === true && resp.data != null);
      } catch {
        setHasActiveFellowship(false);
      }
    };
    checkFellowship();
  }, [currentUser]);

  // Open Auth Modal
  const handleOpenLogin = (initialTab?: 'citizen' | 'officer') => {
    setAuthModalInitialTab(initialTab || 'citizen');
    setIsAuthModalOpen(true);
  };

  // Sign out user session & return to clean landing login page
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
    setApiRole('guest');
    setCurrentTab('login');
    setHasActiveFellowship(false);
  };

  // Handle successful login
  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    const roleMap: Record<string, string> = {
      'APPLICANT': user.id === 'app-user-05' ? 'applicant-amitabh' :
                   user.id === 'app-user-03' ? 'applicant-sunita' : 'applicant-pooja',
      'INO': 'ino-officer',
      'STATE_NODAL': 'state-nodal',
      'COMMITTEE': 'committee-member',
      'MOTA_ADMIN': 'mota-admin',
      'KIOSK_OPERATOR': 'kiosk-operator'
    };
    const mapped = roleMap[user.role] || 'applicant-pooja';
    setCurrentRole(mapped);
    setApiRole(user.role);

    // Direct user to their statutory workspace
    if (user.role === 'INO' || user.role === 'STATE_NODAL') {
      setCurrentTab('verification');
    } else if (user.role === 'COMMITTEE') {
      setCurrentTab('committee');
    } else if (user.role === 'MOTA_ADMIN') {
      setCurrentTab('analytics');
    } else if (user.role === 'KIOSK_OPERATOR') {
      setCurrentTab('kiosk');
    } else {
      setCurrentTab('applicant');
    }

    setIsAuthModalOpen(false);
  };

  // Switch persona fallback helper for RoleGuard simulation links
  const handleSwitchPersona = (personaId: string) => {
    setCurrentRole(personaId);
    const userMap: Record<string, AuthenticatedUser> = {
      'applicant-pooja': {
        id: 'app-user-01',
        name: 'Pooja Maravi',
        email: 'pooja.maravi@jnu.ac.in',
        phone: '+91 98765 43210',
        aadhaarMasked: 'XXXX-XXXX-4123',
        role: 'APPLICANT',
        category: 'PVTG',
        isKycVerified: true,
        designationTitle: 'Citizen / ST Ph.D Scholar'
      },
      'applicant-amitabh': {
        id: 'app-user-05',
        name: 'Amitabh Gond',
        email: 'amitabh.gond@nitrr.ac.in',
        phone: '+91 99887 76655',
        aadhaarMasked: 'XXXX-XXXX-1199',
        role: 'APPLICANT',
        category: 'ST_OTHER',
        isKycVerified: true,
        designationTitle: 'Citizen / B.Tech Scholar'
      },
      'applicant-sunita': {
        id: 'app-user-03',
        name: 'Sunita Soren',
        email: 'sunita.soren@oxford.ac.uk',
        phone: '+91 91234 56789',
        aadhaarMasked: 'XXXX-XXXX-6543',
        role: 'APPLICANT',
        category: 'FEMALE_ST',
        isKycVerified: true,
        designationTitle: 'Citizen / NOS Overseas Scholar'
      },
      'ino-officer': {
        id: 'OFFICER-INO',
        name: 'Dr. Ramesh Chandra',
        email: 'ino@jnu.ac.in',
        role: 'INO',
        isKycVerified: true,
        designationTitle: 'Institute Nodal Officer (Tier 1 Scrutiny)'
      },
      'state-nodal': {
        id: 'OFFICER-STATE-NODAL',
        name: 'Dr. Sunita Barik',
        email: 'sno.tribal@mp.gov.in',
        role: 'STATE_NODAL',
        isKycVerified: true,
        designationTitle: 'State Nodal Officer (Tier 2 Scrutiny)'
      },
      'committee-member': {
        id: 'OFFICER-COMMITTEE',
        name: 'Prof. S. R. Marandi',
        email: 'selection.committee@tribal.gov.in',
        role: 'COMMITTEE',
        isKycVerified: true,
        designationTitle: 'National Selection Committee Chair'
      },
      'mota-admin': {
        id: 'OFFICER-MOTA-ADMIN',
        name: 'Shri A. K. Verma',
        email: 'admin.tribal@gov.in',
        role: 'MOTA_ADMIN',
        isKycVerified: true,
        designationTitle: 'MoTA Super Administrator'
      },
      'kiosk-operator': {
        id: 'VLE-MEESEVA-4912',
        name: 'Shri Rajeshwar Rao',
        email: 'vle.bhadradri@meeseva.telangana.gov.in',
        phone: '+91 94401 23456',
        role: 'KIOSK_OPERATOR',
        isKycVerified: true,
        designationTitle: 'MeeSeva / CSC Authorized VLE Operator'
      }
    };

    if (userMap[personaId]) {
      const u = userMap[personaId];
      setCurrentUser(u);
      setApiRole(u.role);
      if (u.role === 'INO' || u.role === 'STATE_NODAL') {
        setCurrentTab('verification');
      } else if (u.role === 'COMMITTEE') {
        setCurrentTab('committee');
      } else if (u.role === 'MOTA_ADMIN') {
        setCurrentTab('analytics');
      } else if (u.role === 'KIOSK_OPERATOR') {
        setCurrentTab('kiosk');
      } else {
        setCurrentTab('applicant');
      }
    }
  };

  // Determine active applicant based on current persona or current user
  const activeApplicantId =
    currentUser?.id?.startsWith('app-user-') ? currentUser.id :
    currentRole === 'applicant-amitabh' ? 'app-user-05' :
    currentRole === 'applicant-sunita' ? 'app-user-03' : 'app-user-01';

  const activeApplicant: Applicant = applicants.find(a => a.id === activeApplicantId) || {
    id: activeApplicantId,
    name: currentRole === 'applicant-amitabh' ? 'Amitabh Gond' :
          currentRole === 'applicant-sunita' ? 'Sunita Soren' : 'Pooja Maravi',
    email: 'applicant@example.com',
    phone: '+91 98765 43210',
    aadhaarMasked: 'XXXX-XXXX-4123',
    category: currentRole === 'applicant-amitabh' ? 'ST_OTHER' :
              currentRole === 'applicant-sunita' ? 'FEMALE_ST' : 'PVTG',
    isPwD: false,
    isPVTG: currentRole === 'applicant-pooja',
    gender: currentRole === 'applicant-amitabh' ? 'MALE' : 'FEMALE',
    annualIncome: currentRole === 'applicant-amitabh' ? 240000 :
                  currentRole === 'applicant-sunita' ? 420000 : 140000,
    state: currentRole === 'applicant-amitabh' ? 'Chhattisgarh' :
           currentRole === 'applicant-sunita' ? 'Odisha' : 'Madhya Pradesh',
    district: currentRole === 'applicant-amitabh' ? 'Bastar' :
              currentRole === 'applicant-sunita' ? 'Mayurbhanj' : 'Dindori',
    instituteName: currentRole === 'applicant-amitabh' ? 'NIT Raipur' :
                   currentRole === 'applicant-sunita' ? 'University of Oxford' : 'Jawaharlal Nehru University',
    courseLevel: currentRole === 'applicant-sunita' ? 'M.Sc Abroad' : 'Ph.D in Tribal Ethnography',
    academicPercentage: 78.5
  };

  const handleApplyFromSimulator = (schemeCode: string) => {
    setDefaultApplySchemeCode(schemeCode);
    if (!currentUser) {
      handleSwitchPersona('applicant-pooja');
    }
    setIsApplyModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <GovHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        hasActiveFellowship={hasActiveFellowship}
        onOpenKioskModal={() => setIsKioskModalOpen(true)}
      />

      {/* Main Content Area */}
      <ErrorBoundary>
        <main style={{ flex: 1, padding: '1.75rem 0' }}>
          <div className="container">
            {/* Public National Portal Entry & Login Gateway */}
            {!currentUser && currentTab !== 'simulator' && (
              <LandingLoginPage
                onLoginSuccess={handleLoginSuccess}
                onExploreSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* Authenticated Citizen Applicant Dashboard */}
            {currentUser && currentTab === 'applicant' && (
              <ApplicantPortal
                currentRole={currentRole}
                onOpenApplyModal={() => {
                  setDefaultApplySchemeCode(undefined);
                  setIsApplyModalOpen(true);
                }}
              />
            )}

            {/* Authenticated Citizen Fellowship Lifecycle */}
            {currentUser && currentTab === 'fellowship' && hasActiveFellowship && (
              <FellowshipPortal applicantId={activeApplicantId} />
            )}

            {/* Public or Authenticated Eligibility Simulator */}
            {currentTab === 'simulator' && (
              <ScholarshipTwin onSelectSchemeToApply={handleApplyFromSimulator} />
            )}

            {/* Selection Committee Spillover Waterfall */}
            {currentTab === 'waterfall' && (
              <RoleGuard
                allowedRoles={['COMMITTEE', 'MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="National Spillover Waterfall Allocation"
                requiredClearanceLabel="National Selection Committee Member / MoTA Admin"
                suggestedPersonaId="committee-member"
                suggestedPersonaName="Selection Committee Chair"
              >
                <SpilloverVisualizer />
              </RoleGuard>
            )}

            {currentTab === 'verification' && (
              <RoleGuard
                allowedRoles={['INO', 'STATE_NODAL', 'MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="Multi-Tier Nodal Scrutiny & Verification Queue"
                requiredClearanceLabel="Institute Nodal Officer (INO) or State Nodal Officer (SNO)"
                suggestedPersonaId="ino-officer"
                suggestedPersonaName="Institute Nodal Officer (INO)"
              >
                <VerificationQueue currentRole={currentRole} />
              </RoleGuard>
            )}

            {currentTab === 'committee' && (
              <RoleGuard
                allowedRoles={['COMMITTEE', 'MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="National Selection Committee Sign-Off Portal"
                requiredClearanceLabel="National Selection Committee Member / Chair"
                suggestedPersonaId="committee-member"
                suggestedPersonaName="Selection Committee Chair"
              >
                <CommitteeSelectionPortal />
              </RoleGuard>
            )}

            {currentTab === 'analytics' && (
              <RoleGuard
                allowedRoles={['INO', 'STATE_NODAL', 'COMMITTEE', 'MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="MoTA National Operations & Deficiency Radar"
                requiredClearanceLabel="Nodal Officer or Ministry Administrator"
                suggestedPersonaId="mota-admin"
                suggestedPersonaName="MoTA Super Administrator"
              >
                <AdminAnalytics />
              </RoleGuard>
            )}

            {currentTab === 'scheme-config' && (
              <RoleGuard
                allowedRoles={['MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="No-Code / Low-Code Scheme Policy Configurator"
                requiredClearanceLabel="Ministry Super Administrator (MoTA Admin)"
                suggestedPersonaId="mota-admin"
                suggestedPersonaName="MoTA Super Administrator"
              >
                <SchemeConfigurator />
              </RoleGuard>
            )}

            {/* MeeSeva / CSC Assisted Kiosk Gateway */}
            {currentUser && currentTab === 'kiosk' && (
              <RoleGuard
                allowedRoles={['KIOSK_OPERATOR', 'MOTA_ADMIN']}
                currentRole={currentRole}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('officer')}
                onSwitchPersona={handleSwitchPersona}
                featureName="MeeSeva / CSC Assisted Kiosk Gateway"
                requiredClearanceLabel="MeeSeva Authorized VLE Operator / MoTA Admin"
                suggestedPersonaId="kiosk-operator"
                suggestedPersonaName="Shri Rajeshwar Rao (VLE)"
              >
                <div style={{ maxWidth: '800px', margin: '1rem auto' }}>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                      <Building2 size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', color: '#0A2540', marginBottom: '0.5rem', fontWeight: 700 }}>
                      MeeSeva / CSC Assisted Citizen Onboarding Gateway
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '560px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
                      You are authenticated as an empanelled Village Level Entrepreneur (VLE). Launch the assisted registration terminal to onboard remote ST candidates with internal CORS network isolation, live origin switching, and official digital receipt seals.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsKioskModalOpen(true)}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Building2 size={18} /> Launch Assisted Registration Terminal
                    </button>
                  </div>
                </div>
              </RoleGuard>
            )}
          </div>
        </main>
      </ErrorBoundary>

      {/* Dynamic Application Modal */}
      {isApplyModalOpen && (
        <DynamicApplicationForm
          applicant={activeApplicant}
          defaultSchemeCode={defaultApplySchemeCode}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => {
            setIsApplyModalOpen(false);
            setCurrentTab('applicant');
          }}
        />
      )}

      {/* Multilingual Conversational Floating Assistant */}
      <RegionalChatbot
        onSelectScheme={(code) => {
          setDefaultApplySchemeCode(code);
          if (!currentUser) {
            handleSwitchPersona('applicant-pooja');
          }
          setIsApplyModalOpen(true);
        }}
      />

      {/* Government SSO Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalInitialTab}
      />

      {/* Unified Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        recipientId={currentUser?.id || 'app-user-01'}
      />

      {/* MeeSeva / CSC Assisted Kiosk Terminal Modal */}
      <MeeSevaKioskModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
      />

      {/* National Portal Footer */}
      <GovFooter />
    </div>
  );
};

export default App;
