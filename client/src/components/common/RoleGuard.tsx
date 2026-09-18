import React from 'react';
import { ShieldAlert, KeyRound, ArrowRight, Lock, UserCheck } from 'lucide-react';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  currentRole: string;
  onSwitchPersona: (personaId: string) => void;
  children: React.ReactNode;
  featureName: string;
  requiredClearanceLabel: string;
  suggestedPersonaId?: string;
  suggestedPersonaName?: string;
}

const ROLE_MAP: Record<string, UserRole> = {
  'applicant-pooja': 'APPLICANT',
  'applicant-amitabh': 'APPLICANT',
  'applicant-sunita': 'APPLICANT',
  'ino-officer': 'INO',
  'state-nodal': 'STATE_NODAL',
  'committee-member': 'COMMITTEE',
  'mota-admin': 'MOTA_ADMIN'
};

const PERSONA_LABELS: Record<string, { name: string; title: string }> = {
  'applicant-pooja': { name: 'Pooja Maravi', title: 'Citizen / ST Ph.D Applicant' },
  'applicant-amitabh': { name: 'Amitabh Gond', title: 'Citizen / B.Tech Applicant' },
  'applicant-sunita': { name: 'Sunita Soren', title: 'Citizen / NOS Overseas Scholar' },
  'ino-officer': { name: 'Dr. Ramesh Chandra', title: 'Institute Nodal Officer (Tier 1 Scrutiny)' },
  'state-nodal': { name: 'Dr. Sunita Barik', title: 'State Nodal Officer (Tier 2 Scrutiny)' },
  'committee-member': { name: 'Prof. S. R. Marandi', title: 'National Selection Committee Chair' },
  'mota-admin': { name: 'Shri A. K. Verma', title: 'MoTA Super Administrator' }
};

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  currentRole,
  onSwitchPersona,
  children,
  featureName,
  requiredClearanceLabel,
  suggestedPersonaId = 'mota-admin',
  suggestedPersonaName = 'MoTA Super Administrator'
}) => {
  const userRole = ROLE_MAP[currentRole] || 'APPLICANT';

  // MoTA_ADMIN has super-admin override across all modules
  const isAuthorized = userRole === 'MOTA_ADMIN' || allowedRoles.includes(userRole);

  if (isAuthorized) {
    return <>{children}</>;
  }

  const currentPersonaInfo = PERSONA_LABELS[currentRole] || {
    name: currentRole,
    title: userRole
  };

  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', width: '100%' }}>
      <div
        className="gov-card"
        style={{
          borderTop: '5px solid #C82333',
          boxShadow: '0 8px 24px rgba(10, 37, 64, 0.08)',
          padding: '2.25rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: '#FDF0ED',
                color: '#A61C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldAlert size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A61C1C', fontWeight: 700 }}>
                Ministry of Tribal Affairs • IAM Security Gate
              </span>
              <h3 style={{ fontSize: '1.25rem', color: '#0A2540', margin: '0.15rem 0 0' }}>
                Statutory Access Clearance Required
              </h3>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#FDF0ED',
              color: '#A61C1C',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #F7B8B8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Lock size={12} /> RBAC Tier Restricted
          </span>
        </div>

        {/* Feature & Clearance Explanation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9375rem', color: '#2D3748', lineHeight: 1.6 }}>
            You are attempting to access <strong>"{featureName}"</strong>.
            Under MoTA Digital Governance & PFMS-DBT Security Guidelines, this administrative function is restricted strictly to authorized government scrutiny authorities.
          </p>
        </div>

        {/* Status Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
            backgroundColor: '#F8FAFC',
            padding: '1.25rem',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}
        >
          {/* Current Persona */}
          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>
              Current Active Persona
            </span>
            <div style={{ marginTop: '0.35rem', fontWeight: 700, color: '#0A2540', fontSize: '0.9375rem' }}>
              {currentPersonaInfo.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.15rem' }}>
              {currentPersonaInfo.title}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#A61C1C',
                backgroundColor: '#FDF0ED',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}
            >
              Role: {userRole} (Insufficient Clearance)
            </span>
          </div>

          {/* Required Clearance */}
          <div>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>
              Required Clearance Level
            </span>
            <div style={{ marginTop: '0.35rem', fontWeight: 700, color: '#1A4D8F', fontSize: '0.9375rem' }}>
              {requiredClearanceLabel}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.15rem' }}>
              Statutory verification authority with digital audit sign-off
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#166534',
                backgroundColor: '#F0FDF4',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}
            >
              Eligible: {allowedRoles.join(' or ')}
            </span>
          </div>
        </div>

        {/* Action Controls for Evaluator Convenience */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', color: '#4A5568', marginBottom: '0.75rem', fontWeight: 500 }}>
            SIH Evaluator Quick Access — Switch to an authorized persona to test this module:
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onSwitchPersona(suggestedPersonaId)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserCheck size={16} />
              <span>Switch to {suggestedPersonaName}</span>
              <ArrowRight size={14} />
            </button>

            {suggestedPersonaId !== 'mota-admin' && (
              <button
                type="button"
                onClick={() => onSwitchPersona('mota-admin')}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <KeyRound size={15} />
                <span>Switch to MoTA Super Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
