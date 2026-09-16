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
import { api } from './services/api';
import type { Applicant } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('applicant');
  const [currentRole, setCurrentRole] = useState<string>('applicant-pooja');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [defaultApplySchemeCode, setDefaultApplySchemeCode] = useState<string | undefined>(undefined);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

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
            <VerificationQueue currentRole={currentRole} />
          )}

          {currentTab === 'committee' && (
            <CommitteeSelectionPortal />
          )}

          {currentTab === 'analytics' && (
            <AdminAnalytics />
          )}

          {currentTab === 'scheme-config' && (
            <SchemeConfigurator />
          )}
        </div>
      </main>

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
