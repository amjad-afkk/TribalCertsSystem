import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { AuthenticatedUser } from './AuthModal';
import {
  ShieldCheck, Lock, UserCheck, KeyRound, CheckCircle,
  RefreshCw, Sparkles, ArrowRight, Award
} from 'lucide-react';

interface LandingLoginPageProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onExploreSimulator: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({
  onLoginSuccess,
  onExploreSimulator
}) => {
  const [activeTab, setActiveTab] = useState<'citizen' | 'officer'>('citizen');

  // Citizen Aadhaar OTP states
  const [identifier, setIdentifier] = useState('XXXX-XXXX-4123');
  const [aadhaarConsent, setAadhaarConsent] = useState(true);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Officer SSO states
  const [designation, setDesignation] = useState('INO');
  const [officerId, setOfficerId] = useState('OFFICER-INO-01');
  const [pin, setPin] = useState('1234');
  const [officerLoading, setOfficerLoading] = useState(false);
  const [officerError, setOfficerError] = useState<string | null>(null);

  // 60s countdown timer
  useEffect(() => {
    let interval: any = null;
    if (otpSessionId && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSessionId, timerSeconds]);

  // Request Aadhaar OTP
  const handleSendOtp = async (customIdentifier?: string, personaId?: string) => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);
    try {
      const resp = await api.sendOtp({
        identifier: customIdentifier || identifier,
        personaId
      });

      if (resp.success) {
        setOtpSessionId(resp.sessionId);
        setTimerSeconds(60);
        setOtpMessage(`Simulated OTP 123456 sent to mobile registered with Aadhaar ending in ${resp.maskedIdentifier?.slice(-4) || '4123'}.`);
        setOtpValue('123456'); // Pre-fill sandbox OTP for frictionless hackathon evaluation
      } else {
        setOtpError(resp.message || 'Failed to generate Aadhaar OTP');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Network error communicating with authentication service');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP & Authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSessionId) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const resp = await api.verifyOtp({
        sessionId: otpSessionId,
        otp: otpValue
      });

      if (resp.success && resp.user) {
        onLoginSuccess({
          id: resp.user.id,
          name: resp.user.name,
          email: resp.user.email,
          phone: resp.user.phone,
          aadhaarMasked: resp.user.aadhaarMasked,
          role: resp.user.role,
          category: resp.user.category,
          isKycVerified: true,
          designationTitle: resp.user.role === 'APPLICANT' ? 'Citizen / ST Scholar' : resp.user.role
        });
      } else {
        setOtpError(resp.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Network error verifying credentials');
    } finally {
      setOtpLoading(false);
    }
  };

  // Quick citizen test login
  const handleQuickCitizenLogin = (personaKey: 'pooja' | 'amitabh' | 'sunita') => {
    const personas: Record<string, { identifier: string; personaId: string }> = {
      pooja: { identifier: 'XXXX-XXXX-4123', personaId: 'applicant-pooja' },
      amitabh: { identifier: 'XXXX-XXXX-9901', personaId: 'applicant-amitabh' },
      sunita: { identifier: 'XXXX-XXXX-6789', personaId: 'applicant-sunita' }
    };
    const p = personas[personaKey];
    setIdentifier(p.identifier);
    handleSendOtp(p.identifier, p.personaId);
  };

  // Official Jan Parichay Login
  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerLoading(true);
    setOfficerError(null);
    try {
      const resp = await api.officerLogin({ designation, officerId, pin });
      if (resp.success && resp.user) {
        onLoginSuccess({
          id: resp.user.id,
          name: resp.user.name,
          email: resp.user.email,
          role: resp.user.role,
          isKycVerified: true,
          designationTitle: resp.user.designationTitle || designation
        });
      } else {
        setOfficerError(resp.message || 'Invalid officer credentials or PIN');
      }
    } catch (err: any) {
      setOfficerError(err.message || 'Authentication service error');
    } finally {
      setOfficerLoading(false);
    }
  };

  const handleQuickOfficerLogin = (roleKey: 'INO' | 'STATE_NODAL' | 'COMMITTEE' | 'MOTA_ADMIN') => {
    const roles: Record<string, { designation: string; id: string; pin: string }> = {
      INO: { designation: 'INO', id: 'OFFICER-INO-01', pin: '1234' },
      STATE_NODAL: { designation: 'STATE_NODAL', id: 'OFFICER-SNO-MP', pin: '1234' },
      COMMITTEE: { designation: 'COMMITTEE', id: 'OFFICER-COMM-01', pin: '1234' },
      MOTA_ADMIN: { designation: 'MOTA_ADMIN', id: 'ADMIN-MOTA-01', pin: '1234' }
    };
    const r = roles[roleKey];
    setDesignation(r.designation);
    setOfficerId(r.id);
    setPin(r.pin);

    // Instant login for evaluator convenience
    onLoginSuccess({
      id: r.id,
      name:
        roleKey === 'INO' ? 'Dr. Ramesh Chandra' :
        roleKey === 'STATE_NODAL' ? 'Dr. Sunita Barik' :
        roleKey === 'COMMITTEE' ? 'Prof. S. R. Marandi' : 'Shri A. K. Verma',
      email: `${roleKey.toLowerCase()}@tribal.gov.in`,
      role: roleKey,
      isKycVerified: true,
      designationTitle:
        roleKey === 'INO' ? 'Institute Nodal Officer (Tier 1)' :
        roleKey === 'STATE_NODAL' ? 'State Nodal Officer (Tier 2)' :
        roleKey === 'COMMITTEE' ? 'Selection Committee Chair' : 'MoTA Super Administrator'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1080px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Hero Welcome Header */}
      <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#EBF3FC',
          color: '#1A4D8F',
          padding: '0.35rem 0.85rem',
          borderRadius: '50px',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: '0.85rem'
        }}>
          <ShieldCheck size={14} /> Official Government of India Single Sign-On Portal
        </div>

        <h1 style={{ fontSize: '2rem', color: '#0A2540', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          National Tribal Scholarship & Fellowship Portal
        </h1>
        <p style={{ color: '#4A5568', fontSize: '0.9375rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
          Unified digital platform by the <strong>Ministry of Tribal Affairs</strong> supporting Direct Benefit Transfer (DBT), AI document cross-checks, and statutory quota governance.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="gov-card" style={{
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(10, 37, 64, 0.08)',
        borderTop: '4px solid #1A4D8F'
      }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '1.75rem' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('citizen'); setOtpError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === 'citizen' ? '#1A4D8F' : '#64748B',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'citizen' ? '3px solid #1A4D8F' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={17} />
            <span>Citizen / Student Login (Aadhaar OTP)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('officer'); setOfficerError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === 'officer' ? '#1A4D8F' : '#64748B',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'officer' ? '3px solid #1A4D8F' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={17} />
            <span>Official SSO (Jan Parichay)</span>
          </button>
        </div>

        {/* Tab 1: Citizen Login */}
        {activeTab === 'citizen' && (
          <div>
            {!otpSessionId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '0.8125rem', color: '#4A5568', lineHeight: 1.45 }}>
                  Enter your 12-digit Aadhaar Number or registered mobile number to receive a secure one-time password (OTP) via UIDAI gateway.
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Aadhaar Number / Registered Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. XXXX-XXXX-4123 or 9876543210"
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="consent"
                    checked={aadhaarConsent}
                    onChange={(e) => setAadhaarConsent(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <label htmlFor="consent" style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, cursor: 'pointer' }}>
                    I give voluntary consent to the Ministry of Tribal Affairs to verify my identity via the UIDAI Aadhaar authentication system for scholarship processing under Section 7 of the Aadhaar Act, 2016.
                  </label>
                </div>

                {otpError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '0.75rem', borderRadius: '4px', color: '#DC2626', fontSize: '0.8125rem' }}>
                    {otpError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="btn btn-primary"
                  disabled={!aadhaarConsent || otpLoading}
                  style={{ padding: '0.65rem', justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  {otpLoading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Lock size={15} />
                  )}
                  <span>{otpLoading ? 'Connecting to UIDAI Gateway...' : 'Request Aadhaar OTP'}</span>
                </button>

                {/* SIH Evaluator Quick Fill Buttons */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>
                    SIH Evaluator Quick Test Profiles (1-Click Instant Login):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickCitizenLogin('pooja')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                    >
                      <UserCheck size={13} style={{ color: '#1A4D8F' }} />
                      <span>Pooja Maravi (ST Ph.D)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCitizenLogin('amitabh')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                    >
                      <UserCheck size={13} style={{ color: '#1A4D8F' }} />
                      <span>Amitabh Gond (B.Tech)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCitizenLogin('sunita')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                    >
                      <UserCheck size={13} style={{ color: '#1A4D8F' }} />
                      <span>Sunita Soren (NOS Abroad)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {otpMessage && (
                  <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem', borderRadius: '4px', color: '#166534', fontSize: '0.8125rem' }}>
                    {otpMessage}
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Enter 6-Digit Aadhaar OTP</label>
                    <span style={{ fontSize: '0.75rem', color: timerSeconds > 0 ? '#1A4D8F' : '#DC2626', fontWeight: 600 }}>
                      {timerSeconds > 0 ? `Expires in ${timerSeconds}s` : 'OTP Expired'}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="123456"
                    style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: '1.25rem', fontWeight: 700 }}
                    required
                  />
                </div>

                {otpError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '0.75rem', borderRadius: '4px', color: '#DC2626', fontSize: '0.8125rem' }}>
                    {otpError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpSessionId(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Change Aadhaar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={otpValue.length !== 6 || otpLoading}
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {otpLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    <span>{otpLoading ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Officer SSO Login */}
        {activeTab === 'officer' && (
          <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', color: '#4A5568', lineHeight: 1.45 }}>
              Single Sign-On access for registered Government Verification Officials, Selection Committees, and MoTA Administrators.
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Statutory Designation & Clearance Tier</label>
              <select
                className="form-select"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="INO">Institute Nodal Officer (INO) — Tier 1 Scrutiny</option>
                <option value="STATE_NODAL">State Nodal Officer (SNO) — Tier 2 Scrutiny</option>
                <option value="COMMITTEE">National Selection Committee (NOS/NFST)</option>
                <option value="MOTA_ADMIN">Ministry Super Administrator (MoTA Admin)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Official Employee ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="OFFICER-INO-01"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">4-Digit Security PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  required
                />
              </div>
            </div>

            {officerError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '0.75rem', borderRadius: '4px', color: '#DC2626', fontSize: '0.8125rem' }}>
                {officerError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={officerLoading}
              style={{ padding: '0.65rem', justifyContent: 'center', fontSize: '0.875rem' }}
            >
              {officerLoading ? <RefreshCw size={16} className="animate-spin" /> : <KeyRound size={15} />}
              <span>{officerLoading ? 'Authenticating...' : 'Sign In via Jan Parichay Gateway'}</span>
            </button>

            {/* Quick Officer Switch Buttons */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>
                SIH Evaluator Quick Officer Logins (1-Click Instant Access):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('INO')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                >
                  <ShieldCheck size={13} style={{ color: '#1A4D8F' }} />
                  <span>Dr. Ramesh Chandra (Tier 1 INO)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('STATE_NODAL')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                >
                  <ShieldCheck size={13} style={{ color: '#1B7837' }} />
                  <span>Dr. Sunita Barik (Tier 2 State)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('COMMITTEE')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                >
                  <Award size={13} style={{ color: '#E06D14' }} />
                  <span>Prof. S. R. Marandi (Committee)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('MOTA_ADMIN')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.45rem 0.65rem' }}
                >
                  <KeyRound size={13} style={{ color: '#0A2540' }} />
                  <span>Shri A. K. Verma (MoTA Admin)</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Public Self-Service Banner: Scholarship Twin Simulator */}
      <div className="gov-card" style={{
        backgroundColor: '#F8FAFC',
        borderLeft: '4px solid #1A4D8F',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#EBF3FC', color: '#1A4D8F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
              Not sure which scholarship or fellowship you qualify for?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
              Try the <strong>Scholarship Twin (Predictive Eligibility Simulator)</strong> to instantly evaluate your criteria across all 5 schemes without logging in.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExploreSimulator}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={15} />
          <span>Launch Eligibility Twin</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Overview of the 5 MoTA Schemes */}
      <div>
        <h3 style={{ fontSize: '1.125rem', color: '#0A2540', marginBottom: '1rem', fontWeight: 700 }}>
          Schemes Administered under the Unified Portal
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">ARG45</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>750 Annual Slots</span>
            </div>
            <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', margin: '0 0 0.35rem', fontWeight: 700 }}>
              National Fellowship for ST Students (NFST)
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              M.Phil / Ph.D research fellowship in premier Indian universities with statutory Divyangjan and PVTG priority buckets.
            </p>
          </div>

          <div className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-approved">AZKMI</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>20 Annual Slots</span>
            </div>
            <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', margin: '0 0 0.35rem', fontWeight: 700 }}>
              National Overseas Scholarship (NOS)
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              Master’s & Ph.D abroad at QS Top 1000 world universities covering complete tuition fees and international living allowances.
            </p>
          </div>

          <div className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-secondary">TCE01</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>1000 Slots</span>
            </div>
            <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', margin: '0 0 0.35rem', fontWeight: 700 }}>
              Top Class Education for ST Students
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              Undergraduate and Postgraduate degree courses in notified premier institutes (IITs, IIMs, NITs, AIIMS, NLU).
            </p>
          </div>

          <div className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">PMS01</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Open Demand</span>
            </div>
            <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', margin: '0 0 0.35rem', fontWeight: 700 }}>
              Post-Matric Scholarship for ST Students
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              Class 11, Class 12, and post-secondary collegiate courses with mandatory State Nodal and DBT PFMS linkage.
            </p>
          </div>

          <div className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">PRM01</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Open Demand</span>
            </div>
            <h4 style={{ fontSize: '0.9375rem', color: '#0A2540', margin: '0 0 0.35rem', fontWeight: 700 }}>
              Pre-Matric Scholarship for ST Students
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              Classes 9 and 10 secondary school education support to arrest dropout rates among Scheduled Tribe children.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
