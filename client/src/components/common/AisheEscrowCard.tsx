import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, AlertOctagon, Building2, User } from 'lucide-react';

interface AisheEscrowCardProps {
  schemeCode: string;
  totalAwardAmount: number;
  instituteCode?: string;
  instituteName?: string;
  aadhaarMasked?: string;
}

export const AisheEscrowCard: React.FC<AisheEscrowCardProps> = ({
  schemeCode,
  totalAwardAmount,
  instituteCode = 'U-0108',
  instituteName = 'Jawaharlal Nehru University (JNU), New Delhi',
  aadhaarMasked = 'XXXX-XXXX-4123'
}) => {
  const [escrowPlan, setEscrowPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const resp = await api.calculateEscrowPlan({
          schemeCode,
          totalAwardAmount,
          aisheCode: instituteCode,
          aadhaarMasked
        });
        if (resp && resp.success) {
          setEscrowPlan(resp.data);
        }
      } catch (err) {
        console.error('Failed to calculate escrow plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [schemeCode, totalAwardAmount, instituteCode, aadhaarMasked]);

  if (loading || !escrowPlan) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B' }}>
        Verifying AISHE Accreditation & Escrow Routing...
      </div>
    );
  }

  const isLowRisk = escrowPlan.fraudRiskScore < 20;

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: `1px solid ${isLowRisk ? '#BBF7D0' : '#FECACA'}`,
      borderLeft: `4px solid ${isLowRisk ? '#16A34A' : '#DC2626'}`,
      borderRadius: '6px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLowRisk ? (
            <ShieldCheck size={18} style={{ color: '#16A34A' }} />
          ) : (
            <AlertOctagon size={18} style={{ color: '#DC2626' }} />
          )}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
              AISHE Institutional Anti-Fraud Verification & Dual Escrow Split
            </h4>
            <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
              Directory Code: <strong>{escrowPlan.instituteRecipient.aisheCode}</strong> • Fraud Risk Score: <strong style={{ color: isLowRisk ? '#16A34A' : '#DC2626' }}>{escrowPlan.fraudRiskScore}/100 ({isLowRisk ? 'Verified Clean' : 'High Risk'})</strong>
            </span>
          </div>
        </div>

        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          padding: '0.2rem 0.55rem',
          borderRadius: '4px',
          backgroundColor: isLowRisk ? '#DCFCE7' : '#FEE2E2',
          color: isLowRisk ? '#166534' : '#991B1B'
        }}>
          {isLowRisk ? 'PFMS Treasury Escrow Mapped' : 'Unverified Institute Alert'}
        </span>
      </div>

      {/* Dual Escrow Routing Diagram */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
        backgroundColor: '#F8FAFC',
        padding: '0.875rem',
        borderRadius: '6px',
        border: '1px solid #E2E8F0'
      }}>
        {/* Branch 1: Institute Escrow (Tuition) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '4px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700 }}>
            <Building2 size={14} /> Institutional Tuition Escrow
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540' }}>
            ₹{escrowPlan.institutionalEscrowAmount.toLocaleString('en-IN')}
          </div>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748B', lineHeight: 1.3 }}>
            Routed directly to Treasury Account: <code>{escrowPlan.instituteRecipient.pfmsTreasuryCode}</code> ({instituteName}) to prevent ghost student fee hoarding.
          </p>
        </div>

        {/* Branch 2: Student DBT Direct */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '4px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803D', fontSize: '0.75rem', fontWeight: 700 }}>
            <User size={14} /> Direct Benefit Transfer (DBT)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#15803D' }}>
            ₹{escrowPlan.studentDbtDirectAmount.toLocaleString('en-IN')}
          </div>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748B', lineHeight: 1.3 }}>
            Living, book, and laptop grants disbursed straight into student’s Aadhaar-linked NPCI account (<code>{aadhaarMasked}</code>).
          </p>
        </div>
      </div>

      {escrowPlan.fraudRiskReasons.length > 0 && (
        <div style={{ fontSize: '0.6875rem', color: '#991B1B', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {escrowPlan.fraudRiskReasons.map((r: string, idx: number) => (
            <div key={idx}>⚠️ {r}</div>
          ))}
        </div>
      )}
    </div>
  );
};
