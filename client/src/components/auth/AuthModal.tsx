import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck, Lock, UserCheck, KeyRound, CheckCircle,
  RefreshCw, X, ArrowRight, Sparkles
} from 'lucide-react';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  aadhaarMasked?: string;
  role: string;
  category?: string;
  isKycVerified: boolean;
  designationTitle?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthenticatedUser) => void;
  initialTab?: 'citizen' | 'officer';
  isAuthorizedMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'citizen',
  isAuthorizedMode = false
}) => {
  const [authTab, setAuthTab] = useState<'citizen' | 'officer'>(
    isAuthorizedMode ? (initialTab || 'officer') : 'citizen'
  );

  useEffect(() => {
    if (!isAuthorizedMode) {
      setAuthTab('citizen');
    } else {
      setAuthTab(initialTab || 'officer');
    }
  }, [isAuthorizedMode, initialTab, isOpen]);

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
  const [officerDesignation, setOfficerDesignation] = useState<'INO' | 'STATE_NODAL' | 'COMMITTEE' | 'MOTA_ADMIN' | 'KIOSK_OPERATOR'>('INO');
  const [officerId, setOfficerId] = useState('INO-JH-2026-88');
  const [officerPin, setOfficerPin] = useState('1234');
  const [officerLoading, setOfficerLoading] = useState(false);
  const [officerError, setOfficerError] = useState<string | null>(null);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any;
    if (otpSessionId && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSessionId, timerSeconds]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (targetPersonaId?: string) => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const resp = await api.sendOtp({
        identifier: identifier.replace(/[\s-]/g, ''),
        personaId: targetPersonaId
      });

      if (resp.success) {
        setOtpSessionId(resp.sessionId);
        setTimerSeconds(resp.expiresInSeconds || 60);
        setOtpMessage(resp.message || `Simulated OTP: ${resp.otpPreview} sent to ${resp.maskedPhone}`);
        // Auto-fill for seamless SIH demo evaluation convenience
        setOtpValue(resp.otpPreview || '123456');
      } else {
        setOtpError(resp.message || 'Failed to dispatch OTP. Please check the Aadhaar/Mobile number.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Network error while dispatching OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpSessionId || !otpValue.trim()) return;
    setOtpLoading(true);
    setOtpError(null);

    try {
      const resp = await api.verifyOtp({
        sessionId: otpSessionId,
        otp: otpValue.trim()
      });

      if (resp.success && resp.user) {
        onLoginSuccess(resp.user);
        onClose();
      } else {
        setOtpError(resp.message || 'Incorrect verification code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Error verifying OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Officer SSO Sign In
  const handleOfficerLogin = async () => {
    setOfficerLoading(true);
    setOfficerError(null);

    try {
      const resp = await api.officerLogin({
        designation: officerDesignation,
        officerId,
        pin: officerPin
      });

      if (resp.success && resp.user) {
        onLoginSuccess(resp.user);
        onClose();
      } else {
        setOfficerError(resp.message || 'Officer authentication failed.');
      }
    } catch (err: any) {
      setOfficerError(err.message || 'Officer login request error');
    } finally {
      setOfficerLoading(false);
    }
  };

  const handleQuickSelectCitizen = (personaId: string, aadhaarStr: string) => {
    setIdentifier(aadhaarStr);
    handleSendOtp(personaId);
  };

  const handleQuickSelectOfficer = (desig: 'INO' | 'STATE_NODAL' | 'COMMITTEE' | 'MOTA_ADMIN' | 'KIOSK_OPERATOR') => {
    setOfficerDesignation(desig);
    if (desig === 'INO') setOfficerId('INO-MP-2026-102');
    if (desig === 'STATE_NODAL') setOfficerId('SNO-JH-GOV-441');
    if (desig === 'COMMITTEE') setOfficerId('COMM-CHAIR-MOTA-01');
    if (desig === 'MOTA_ADMIN') setOfficerId('MOTA-SUPER-ADMIN-SEC');
    if (desig === 'KIOSK_OPERATOR') setOfficerId('VLE-MEESEVA-4912');
    setOfficerPin('1234');
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(3px)'
    }}>
      <div className="gov-card" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderTop: '5px solid #1A4D8F',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with National Emblem styling */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8125rem'
            }}>
              MoTA
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#4A5568', fontWeight: 600, letterSpacing: '0.05em' }}>
                Ministry of Tribal Affairs • GOI
              </div>
              <h2 style={{ fontSize: '1.2rem', color: '#0A2540', fontWeight: 700 }}>
                National Single Sign-On Portal
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.5rem' }}
            title="Close Login Window"
          >
            <X size={16} />
          </button>
        </div>

        {/* Portal Header / Tab Indicator based on Authorized Mode */}
        {!isAuthorizedMode ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '0.65rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: '#1A4D8F' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: '#0A2540', display: 'block' }}>
                  Citizen & ST Student Login (Aadhaar OTP)
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Aadhaar Act, 2016 Compliant DBT Direct Authentication
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              PUBLIC INTERNET
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#EBF3FC',
            border: '1.5px solid #93C5FD',
            borderRadius: '6px',
            padding: '0.65rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#1A4D8F' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: '#0A2540', display: 'block' }}>
                  Official Jan Parichay Single Sign-On
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                  Authorized Scrutiny Officials, State Nodal Officers & MoTA Committee
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              SWAN INTRANET
            </span>
          </div>
        )}

        {/* TAB 1: CITIZEN AADHAAR OTP LOGIN */}
        {authTab === 'citizen' && (
          <div>
            {!otpSessionId ? (
              /* Step 1: Aadhaar Input & Consent */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.875rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', color: '#334155' }}>
                  <strong>Aadhaar Act, 2016 (Section 7 Compliance):</strong> Authenticate using your 12-digit Aadhaar number or Aadhaar-registered mobile number for direct scholarship DBT verification.
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Enter 12-Digit Aadhaar Number or Registered Mobile
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 5412 8891 4123"
                      maxLength={19}
                      style={{ fontSize: '1rem', letterSpacing: '0.05em', paddingLeft: '2.5rem' }}
                    />
                    <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '0.8rem', color: '#718096' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <input
                    type="checkbox"
                    id="consent-box"
                    checked={aadhaarConsent}
                    onChange={(e) => setAadhaarConsent(e.target.checked)}
                    style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent-box" style={{ fontSize: '0.75rem', color: '#4A5568', lineHeight: 1.4, cursor: 'pointer' }}>
                    I hereby give voluntary consent to the Ministry of Tribal Affairs (MoTA) to fetch my demographic details and identity proof for DBT scholarship and fellowship sanctioning under the Aadhaar Act, 2016.
                  </label>
                </div>

                {otpError && (
                  <div style={{ backgroundColor: '#FDF0ED', color: '#A61C1C', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.8125rem', border: '1px solid #F7B8B8' }}>
                    {otpError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={otpLoading || !aadhaarConsent || !identifier.trim()}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9375rem' }}
                >
                  {otpLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Contacting UIDAI e-KYC Server...
                    </>
                  ) : (
                    <>
                      Send e-KYC OTP <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* SIH Evaluator Quick Fill Box */}
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={14} style={{ color: '#E06D14' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A2540', textTransform: 'uppercase' }}>
                      SIH Evaluator Quick Test Profiles:
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectCitizen('applicant-pooja', 'XXXX-XXXX-4123')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', padding: '0.4rem 0.6rem' }}
                    >
                      <strong style={{ color: '#1A4D8F' }}>Pooja Maravi</strong>
                      <span style={{ fontSize: '0.6875rem', color: '#718096' }}>PVTG • Ph.D NFST Scholar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSelectCitizen('applicant-amitabh', 'XXXX-XXXX-1199')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', padding: '0.4rem 0.6rem' }}
                    >
                      <strong style={{ color: '#92400E' }}>Amitabh Gond</strong>
                      <span style={{ fontSize: '0.6875rem', color: '#718096' }}>Deficiency Resubmission Demo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSelectCitizen('applicant-sunita', 'XXXX-XXXX-6543')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', padding: '0.4rem 0.6rem' }}
                    >
                      <strong style={{ color: '#3730A3' }}>Sunita Soren</strong>
                      <span style={{ fontSize: '0.6875rem', color: '#718096' }}>NOS • Oxford University (QS #3)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: OTP Verification Screen */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#EAF7EE', border: '1px solid #A3E0B5', padding: '0.85rem', borderRadius: '6px', color: '#176529', fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle size={15} /> OTP Dispatched via UIDAI SMS Gateway
                  </div>
                  <div>{otpMessage}</div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                      Enter 6-Digit Verification Code
                    </label>
                    <span style={{ fontSize: '0.75rem', color: timerSeconds > 0 ? '#1A4D8F' : '#A61C1C', fontWeight: 600 }}>
                      {timerSeconds > 0 ? `Valid for: ${timerSeconds}s` : 'Code Expired'}
                    </span>
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    style={{ fontSize: '1.25rem', letterSpacing: '0.35em', textAlign: 'center', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.6875rem', color: '#718096', marginTop: '0.25rem' }}>
                    (Sandbox Test Mode: Simulated OTP is <strong>123456</strong>)
                  </div>
                </div>

                {otpError && (
                  <div style={{ backgroundColor: '#FDF0ED', color: '#A61C1C', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.8125rem', border: '1px solid #F7B8B8' }}>
                    {otpError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={timerSeconds > 40 || otpLoading}
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <RefreshCw size={14} /> Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpValue.length < 6}
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {otpLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Verify & Sign In
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOtpSessionId(null)}
                  style={{ background: 'none', border: 'none', color: '#718096', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem' }}
                >
                  ← Change Aadhaar Number
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OFFICIAL / NODAL SSO LOGIN */}
        {authTab === 'officer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.875rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', color: '#334155' }}>
              <strong>Government Parichay / MeriPehchaan SSO:</strong> Authorized access for Institute Nodal Officers, State Nodal Officers, and MoTA Selection Committees.
            </div>

            <div className="form-group">
              <label className="form-label">Official Clearance Role</label>
              <select
                className="form-select"
                value={officerDesignation}
                onChange={(e) => handleQuickSelectOfficer(e.target.value as any)}
              >
                <option value="INO">Tier 1: Institute Nodal Officer (INO)</option>
                <option value="STATE_NODAL">Tier 2: State Nodal Officer (SNO - Directorate)</option>
                <option value="COMMITTEE">Selection Committee Chair (NOS & NFST Award)</option>
                <option value="MOTA_ADMIN">MoTA Super Administrator (Ministry Level)</option>
                <option value="KIOSK_OPERATOR">MeeSeva / CSC Kiosk Authorized Operator (VLE)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Official Gov ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. INO-MP-2026-102"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Security 2FA PIN</label>
                <input
                  type="password"
                  className="form-input"
                  value={officerPin}
                  onChange={(e) => setOfficerPin(e.target.value)}
                  placeholder="PIN"
                  maxLength={6}
                />
              </div>
            </div>

            {officerError && (
              <div style={{ backgroundColor: '#FDF0ED', color: '#A61C1C', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.8125rem', border: '1px solid #F7B8B8' }}>
                {officerError}
              </div>
            )}

            <button
              type="button"
              onClick={handleOfficerLogin}
              disabled={officerLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9375rem' }}
            >
              {officerLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying Gov 2FA Credentials...
                </>
              ) : (
                <>
                  <Lock size={16} /> Authenticate Official Clearance
                </>
              )}
            </button>

            {/* Quick Test Shortcuts for SIH Evaluators */}
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A2540', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                SIH Evaluator Quick Officer Clearances:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickSelectOfficer('INO')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  🏢 Institute Nodal (INO)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectOfficer('STATE_NODAL')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  🏛️ State Nodal (SNO)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectOfficer('COMMITTEE')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  ⚖️ Selection Committee
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectOfficer('MOTA_ADMIN')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  👑 MoTA Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectOfficer('KIOSK_OPERATOR')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gridColumn: 'span 2', color: '#166534', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
                >
                  🏪 MeeSeva / CSC Authorized VLE Operator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
