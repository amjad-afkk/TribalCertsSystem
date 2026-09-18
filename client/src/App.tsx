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
  const [currentTab, setCurrentTab] = useState<string>('applicant');
  const [currentRole, setCurrentRole] = useState<string>('applicant-pooja');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [defaultApplySchemeCode, setDefaultApplySchemeCode] = useState<string | undefined>(undefined);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  // Synchronize active role with API client for RBAC headers
  useEffect(() => {
    setApiRole(currentRole);
  }, [currentRole]);

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

  // Determine active applicant based on current persona
  const activeApplicantId =
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
    district: 'Dindori',
    instituteName: currentRole === 'applicant-amitabh' ? 'NIT Raipur' :
                   currentRole === 'applicant-sunita' ? 'University of Oxford' : 'Jawaharlal Nehru University',
    courseLevel: currentRole === 'applicant-sunita' ? 'M.Sc Abroad' : 'Ph.D in Tribal Ethnography',
    academicPercentage: 78.5
  };

  const handleApplyFromSimulator = (schemeCode: string) => {
    setDefaultApplySchemeCode(schemeCode);
    setIsApplyModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <GovHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* Main Content Area */}
      <ErrorBoundary>
        <main style={{ flex: 1, padding: '1.75rem 0' }}>
          <div className="container">
            {currentTab === 'applicant' && (
              <ApplicantPortal
                currentRole={currentRole}
                onOpenApplyModal={() => {
                  setDefaultApplySchemeCode(undefined);
                  setIsApplyModalOpen(true);
                }}
              />
            )}

            {currentTab === 'simulator' && (
              <ScholarshipTwin onSelectSchemeToApply={handleApplyFromSimulator} />
            )}

            {currentTab === 'waterfall' && (
              <SpilloverVisualizer />
            )}

            {currentTab === 'verification' && (
              <RoleGuard
                allowedRoles={['INO', 'STATE_NODAL', 'MOTA_ADMIN']}
                currentRole={currentRole}
                onSwitchPersona={setCurrentRole}
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
                onSwitchPersona={setCurrentRole}
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
                onSwitchPersona={setCurrentRole}
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
                onSwitchPersona={setCurrentRole}
                featureName="No-Code / Low-Code Scheme Policy Configurator"
                requiredClearanceLabel="Ministry Super Administrator (MoTA Admin)"
                suggestedPersonaId="mota-admin"
                suggestedPersonaName="MoTA Super Administrator"
              >
                <SchemeConfigurator />
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
          setIsApplyModalOpen(true);
        }}
      />

      {/* National Portal Footer */}
      <GovFooter />
    </div>
  );
};

export default App;
