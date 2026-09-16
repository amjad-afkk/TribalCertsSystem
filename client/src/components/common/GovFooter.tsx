import React from 'react';

export const GovFooter: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#0A2540', color: '#94A3B8', fontSize: '0.8125rem', marginTop: '3rem', borderTop: '4px solid #1A4D8F' }}>
      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Ministry of Tribal Affairs</h4>
            <p style={{ lineHeight: 1.6, color: '#CBD5E1', fontSize: '0.75rem' }}>
              Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi 110001.<br/>
              Consolidated National ST Digital Infrastructure supporting Pre-Matric, Post-Matric, Top Class, NFST, and NOS schemes.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.875rem' }}>National Integrations</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ PFMS Direct Benefit Transfer (DBT) Integration</li>
              <li>✓ DigiLocker National Document Repository Link</li>
              <li>✓ Aadhaar e-KYC (Section 7, Aadhaar Act 2016)</li>
              <li>✓ QS World University Rankings 2026 Live Lookup</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Help & Compliance</h4>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: '#CBD5E1' }}>
              Toll-Free National Helpdesk: <strong>1800-11-7788</strong><br/>
              Grievance Redressal: <strong>support.tribal@nic.in</strong><br/>
              Compliant with MeghRaj Cloud Security Guidelines & NIC Cyber Standards.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.6875rem' }}>
          <div>
            © 2026 Ministry of Tribal Affairs, Government of India. Designed for Smart India Hackathon (SIH).
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Hyperlinking Policy</span>
            <span>Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
