import React from 'react';
import { ShieldCheck, UserCheck, Sparkles, Sliders, BarChart3, GitFork, CheckCircle2 } from 'lucide-react';

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
  return (
    <header style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
      {/* Top National Strip */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #E06D14 0%, #E06D14 33%, #FFFFFF 33%, #FFFFFF 66%, #1B7837 66%, #1B7837 100%)'
      }} />

      {/* Main Branding Bar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Emblem Simulation */}
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '4px',
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '0.05em'
          }}>
            MoTA<br/><span style={{ fontSize: '0.625rem', color: '#E06D14' }}>GOI</span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A5568', fontWeight: 600 }}>
              Ministry of Tribal Affairs • Government of India
            </div>
            <h1 style={{ fontSize: '1.25rem', color: '#0A2540', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              National ST Scholarship & Fellowship Unified Portal
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, backgroundColor: '#EBF3FC', color: '#1A4D8F', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #BCD4F0' }}>
                SIH 2026 Edition
              </span>
            </h1>
          </div>
        </div>

        {/* Role Switcher for Hackathon Evaluation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.6875rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
              Demo Persona / RBAC Role
            </span>
            <select
              className="form-select"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.6rem', fontWeight: 500, borderColor: '#BCD4F0', backgroundColor: '#F8FAFC' }}
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            >
              <option value="applicant-pooja">Applicant: Pooja Maravi (PVTG - Ph.D / NFST)</option>
              <option value="applicant-amitabh">Applicant: Amitabh Gond (Deficiency Demo - Income Cap)</option>
              <option value="applicant-sunita">Applicant: Sunita Soren (NOS - Oxford QS #3)</option>
              <option value="ino-officer">Institute Nodal Officer (Tier 1 Scrutiny)</option>
              <option value="state-nodal">State Nodal Officer (Tier 2 Verification)</option>
              <option value="committee-member">Selection Committee (NFST / NOS Sign-off)</option>
              <option value="mota-admin">MoTA Super Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ backgroundColor: '#0A2540', color: '#FFFFFF' }}>
        <div className="container" style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
          {[
            { id: 'applicant', label: 'Applicant Dashboard', icon: UserCheck },
            { id: 'simulator', label: 'Scholarship Twin (Simulator)', icon: Sparkles },
            { id: 'waterfall', label: 'Spillover Visualizer (Waterfall)', icon: GitFork },
            { id: 'verification', label: 'Nodal Scrutiny Queue', icon: ShieldCheck },
            { id: 'committee', label: 'Selection Committee (NOS/NFST)', icon: CheckCircle2 },
            { id: 'analytics', label: 'MoTA Analytics & Heatmap', icon: BarChart3 },
            { id: 'scheme-config', label: 'No-Code Scheme Configurator', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: isActive ? '#1A4D8F' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #E06D14' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
