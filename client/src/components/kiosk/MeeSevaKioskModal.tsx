import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert, ShieldCheck, Building2, CheckCircle2,
  RefreshCw, X, ArrowRight, UserCheck, AlertTriangle, Printer
} from 'lucide-react';

interface MeeSevaKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MeeSevaKioskModal: React.FC<MeeSevaKioskModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Demo Network Toggle: 'AUTHORIZED_SWAN' vs 'PUBLIC_INTERNET'
  const [networkMode, setNetworkMode] = useState<'AUTHORIZED_SWAN' | 'PUBLIC_INTERNET'>('AUTHORIZED_SWAN');

  // Form Fields
  const [studentName, setStudentName] = useState('Kailash Maravi');
  const [aadhaarMasked, setAadhaarMasked] = useState('XXXX-XXXX-9944');
  const [category, setCategory] = useState<'PVTG' | 'DIVYANGJAN' | 'FEMALE_ST' | 'ST_OTHER'>('PVTG');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [annualIncome, setAnnualIncome] = useState<number>(95000);
  const [schemeCode, setSchemeCode] = useState('BPVGK');
  const [instituteName, setInstituteName] = useState('Government Model Tribal Higher Secondary School');
  const [stateName, setStateName] = useState('Madhya Pradesh');
  const [districtName, setDistrictName] = useState('Dindori');
  const [biometricVerified, setBiometricVerified] = useState(true);

  // Kiosk Terminal Configuration
  const [kioskCenterId] = useState('MS-TELANGANA-BHADRADRI-09');
  const [vleOperatorId] = useState('VLE-MEESEVA-4912');
  const [vleLicenseKey] = useState('VLE-MEESEVA-2026-TRIBAL');

  // Execution States
  const [loading, setLoading] = useState(false);
  const [corsError, setCorsError] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const quickFillProfiles = [
    {
      label: 'Kailash Maravi (Class IX • Pre-Matric)',
      name: 'Kailash Maravi',
      aadhaar: 'XXXX-XXXX-9944',
      cat: 'PVTG' as const,
      gender: 'MALE' as const,
      income: 95000,
      scheme: 'BPVGK',
      inst: 'Government Model Tribal Higher Secondary School',
      state: 'Madhya Pradesh',
      dist: 'Dindori'
    },
    {
      label: 'Rupa Bhil (Class XI • Post-Matric)',
      name: 'Rupa Bhil',
      aadhaar: 'XXXX-XXXX-3311',
      cat: 'FEMALE_ST' as const,
      gender: 'FEMALE' as const,
      income: 140000,
      scheme: 'BVOBC',
      inst: 'Bastar Tribal Polytechnic Institute',
      state: 'Chhattisgarh',
      dist: 'Bastar'
    },
    {
      label: 'Devendra Korwa (UG • Top Class)',
      name: 'Devendra Korwa',
      aadhaar: 'XXXX-XXXX-5522',
      cat: 'PVTG' as const,
      gender: 'MALE' as const,
      income: 180000,
      scheme: 'A023B',
      inst: 'National Institute of Technology (NIT) Raipur',
      state: 'Chhattisgarh',
      dist: 'Surguja'
    }
  ];

  const handleApplyQuickProfile = (p: typeof quickFillProfiles[0]) => {
    setStudentName(p.name);
    setAadhaarMasked(p.aadhaar);
    setCategory(p.cat);
    setGender(p.gender);
    setAnnualIncome(p.income);
    setSchemeCode(p.scheme);
    setInstituteName(p.inst);
    setStateName(p.state);
    setDistrictName(p.dist);
    setCorsError(null);
    setReceipt(null);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCorsError(null);
    setReceipt(null);

    // Build headers depending on simulated network mode
    const networkHeaders: Record<string, string> = {};
    if (networkMode === 'AUTHORIZED_SWAN') {
      networkHeaders['x-kiosk-network'] = 'SWAN_AUTHORIZED_INTRANET';
      networkHeaders['x-simulated-origin'] = 'https://kiosk.meeseva.gov.in';
      networkHeaders['x-kiosk-license-key'] = vleLicenseKey;
    } else {
      // Simulate public internet access (will be blocked by internal CORS firewall)
      networkHeaders['x-kiosk-network'] = 'PUBLIC_INTERNET';
      networkHeaders['x-simulated-origin'] = 'http://localhost:5173';
      networkHeaders['x-kiosk-license-key'] = 'UNVERIFIED-PUBLIC-CLIENT';
    }

    try {
      const resp = await api.onboardKioskStudent(
        {
          studentName,
          aadhaarMasked,
          category,
          gender,
          annualIncome: Number(annualIncome),
          schemeCode,
          instituteName,
          state: stateName,
          district: districtName,
          kioskCenterId,
          vleOperatorId,
          biometricVerified
        },
        networkHeaders
      );

      if (resp.success && resp.receipt) {
        setReceipt(resp.receipt);
        if (onSuccess) onSuccess();
      } else {
        setCorsError(resp);
      }
    } catch (err: any) {
      setCorsError({
        error: 'CORS_POLICY_VIOLATION',
        message: err.message || 'Request blocked by MoTA internal perimeter firewall.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="gov-card" style={{ maxWidth: '780px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1A4D8F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Building2 size={16} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
                MeeSeva / CSC Assisted Citizen Onboarding Gateway
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              Official MoTA assisted facilitation terminal for remote ST applicants. Restricted to empanelled SWAN kiosks via Internal CORS origin validation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* DEMO INTERACTIVE NETWORK SWITCHER (REQUESTED FEATURE) */}
        <div style={{
          backgroundColor: networkMode === 'AUTHORIZED_SWAN' ? '#F0FDF4' : '#FEF2F2',
          border: `1.5px solid ${networkMode === 'AUTHORIZED_SWAN' ? '#86EFAC' : '#FCA5A5'}`,
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                {networkMode === 'AUTHORIZED_SWAN' ? (
                  <>
                    <ShieldCheck size={18} style={{ color: '#16A34A' }} />
                    <strong style={{ fontSize: '0.875rem', color: '#166534' }}>
                      Current Network: MeeSeva SWAN Intranet (Empanelled Gateway)
                    </strong>
                    <span style={{ fontSize: '0.6875rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                      AUTHORIZED ORIGIN
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} style={{ color: '#DC2626' }} />
                    <strong style={{ fontSize: '0.875rem', color: '#991B1B' }}>
                      Current Network: Public Internet (Unverified Public Origin)
                    </strong>
                    <span style={{ fontSize: '0.6875rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                      BLOCKED BY CORS
                    </span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: networkMode === 'AUTHORIZED_SWAN' ? '#15803D' : '#B91C1C' }}>
                {networkMode === 'AUTHORIZED_SWAN'
                  ? 'Origin: https://kiosk.meeseva.gov.in • License Key: VLE-MEESEVA-2026-TRIBAL (Verified)'
                  : 'Origin: http://localhost:5173 • Public browser clients are blocked by backend internal CORS whitelist.'}
              </div>
            </div>

            {/* Interactive Switcher Button */}
            <button
              type="button"
              onClick={() => {
                setNetworkMode(prev => prev === 'AUTHORIZED_SWAN' ? 'PUBLIC_INTERNET' : 'AUTHORIZED_SWAN');
                setCorsError(null);
                setReceipt(null);
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: networkMode === 'AUTHORIZED_SWAN' ? '#DC2626' : '#16A34A',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '0.45rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              {networkMode === 'AUTHORIZED_SWAN' ? (
                <>🌐 Switch to Public Internet (Test CORS Block)</>
              ) : (
                <>🔒 Switch to Authorized MeeSeva Network</>
              )}
            </button>
          </div>
        </div>

        {/* Quick Test Profiles */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Evaluator Quick Fill Demo Profiles:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickFillProfiles.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyQuickProfile(p)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                👤 {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* CORS BLOCK ALERT STATE (WHEN SUBMITTED ON PUBLIC INTERNET) */}
        {corsError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #F87171',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <AlertTriangle size={22} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.9375rem', color: '#991B1B', display: 'block', marginBottom: '0.25rem' }}>
                  🚨 403 Forbidden: MoTA Internal CORS Isolation Triggered
                </strong>
                <p style={{ fontSize: '0.8125rem', color: '#7F1D1D', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                  {corsError.message || 'CORS Policy Block: Origin is not in the empanelled Government Intranet whitelist.'}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#991B1B', backgroundColor: '#FEE2E2', padding: '0.4rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  BLOCKED_ORIGIN: {corsError.originBlocked || 'http://localhost:5173'} | NETWORK_STATE: PUBLIC_UNRESTRICTED_INTERNET
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNetworkMode('AUTHORIZED_SWAN');
                      setCorsError(null);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', backgroundColor: '#16A34A', border: 'none' }}
                  >
                    👉 Click to Switch to Authorized MeeSeva SWAN Network & Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL ACKNOWLEDGEMENT RECEIPT (UPON SUCCESSFUL ONBOARDING) */}
        {receipt && (
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '2px solid #22C55E',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #86EFAC', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#16A34A' }} />
                  <strong style={{ fontSize: '1rem', color: '#166534' }}>
                    Official Government Acknowledgement Slip (MeeSeva Assisted DBT)
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '0.2rem' }}>
                  Ministry of Tribal Affairs • Direct Citizen Facilitation Center
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Reference No:</span>
                <strong style={{ fontSize: '0.9375rem', color: '#0A2540', fontFamily: 'monospace' }}>
                  {receipt.ackNumber}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Beneficiary Student:</span>
                <strong style={{ color: '#0A2540' }}>{receipt.studentName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Sanction Scheme:</span>
                <strong style={{ color: '#1A4D8F' }}>{receipt.schemeCode} - {receipt.schemeName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Facilitation Kiosk ID:</span>
                <strong style={{ color: '#0A2540' }}>{receipt.kioskCenterId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Empanelled VLE Operator:</span>
                <strong style={{ color: '#0A2540' }}>{receipt.vleOperatorId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Application Status:</span>
                <span style={{ color: '#166534', fontWeight: 700 }}>QUEUED FOR INSTITUTE SCRUTINY (INO)</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Digital Cryptographic Seal:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#1E293B' }}>
                  {receipt.digitalSeal?.slice(0, 18)}...
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #BBF7D0', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                ✓ Application securely registered in central registry with statutory audit footprint.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Printer size={13} /> Print Acknowledgement
                </button>
                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Register Another Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING REGISTRATION FORM */}
        {!receipt && (
          <form onSubmit={handleSubmitRegistration}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Student Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Kailash Maravi"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Aadhaar Number (Masked) *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={aadhaarMasked}
                  onChange={(e) => setAadhaarMasked(e.target.value)}
                  placeholder="XXXX-XXXX-9944"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Tribal Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="PVTG">PVTG (Particularly Vulnerable Tribal Group)</option>
                  <option value="DIVYANGJAN">Divyangjan (PwD ST Candidate)</option>
                  <option value="FEMALE_ST">Female ST Candidate</option>
                  <option value="ST_OTHER">General ST Candidate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Annual Family Income (₹) *</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  placeholder="e.g. 95000"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Scholarship Scheme *</label>
                <select
                  className="form-select"
                  value={schemeCode}
                  onChange={(e) => setSchemeCode(e.target.value)}
                >
                  <option value="BPVGK">Pre-Matric Scholarship (Class 9-10)</option>
                  <option value="BVOBC">Post-Matric Scholarship (Class 11 - Ph.D)</option>
                  <option value="A023B">National Top Class Education (IIT/IIM/NIT)</option>
                  <option value="ARG45">NFST Ph.D Research Fellowship</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Educational Institute *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="School / College / University Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>State</label>
                <input
                  type="text"
                  className="form-input"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>District</label>
                <input
                  type="text"
                  className="form-input"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                />
              </div>
            </div>

            {/* Operator Biometric Consent Checkbox */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={biometricVerified}
                  onChange={(e) => setBiometricVerified(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#1A4D8F' }}
                />
                <span>
                  <strong>Operator Attestation & Citizen Biometric Consent:</strong> I verify that the applicant is physically present at Kiosk Center <strong>{kioskCenterId}</strong> and demographic details were validated in accordance with the Aadhaar Act, 2016.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !biometricVerified || !studentName.trim()}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Transmitting via SWAN Gateway...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Submit Assisted Student Registration <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
