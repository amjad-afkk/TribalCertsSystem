import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApplicationItem, Applicant } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentVerificationModal } from '../common/DocumentVerificationModal';
import { JanJatiyaSahayakModal } from '../common/JanJatiyaSahayakModal';
import { AisheEscrowCard } from '../common/AisheEscrowCard';
import {
  FileText, AlertTriangle, CheckCircle, Clock,
  PlusCircle, RefreshCw, Send, ShieldCheck, Upload, FileSearch, Volume2
} from 'lucide-react';

interface ApplicantPortalProps {
  currentRole: string;
  onOpenApplyModal: () => void;
}

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({ currentRole, onOpenApplyModal }) => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [digiLockerDocs, setDigiLockerDocs] = useState<any[]>([]);
  const [modalInspectionDossier, setModalInspectionDossier] = useState<{
    document: any;
    applicant?: any;
    scheme?: any;
    applicationId?: string;
  } | null>(null);
  const [sahayakModal, setSahayakModal] = useState<{
    isOpen: boolean;
    applicantName: string;
    deficiencyReason: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitTextMap, setResubmitTextMap] = useState<Record<string, string>>({});
  const [resubmitFilesMap, setResubmitFilesMap] = useState<Record<string, any[]>>({});
  const [resubmitSuccessMap, setResubmitSuccessMap] = useState<Record<string, boolean>>({});

  // Map persona to applicant ID
  const applicantId =
    currentRole === 'applicant-amitabh'
      ? 'app-user-05'
      : currentRole === 'applicant-sunita'
      ? 'app-user-03'
      : 'app-user-01'; // Default: Pooja Maravi

  const loadData = async () => {
    setLoading(true);
    try {
      const [appResp, applicantsResp, dglResp] = await Promise.all([
        api.getApplications({ applicantId }),
        api.getApplicants(),
        api.getDigiLockerDocuments(applicantId)
      ]);

      if (appResp.success && Array.isArray(appResp.data)) {
        setApplications(appResp.data);
      }
      if (applicantsResp.success && Array.isArray(applicantsResp.data)) {
        const found = applicantsResp.data.find((a: any) => a.id === applicantId);
        if (found) setApplicant(found);
      }
      if (dglResp.success && Array.isArray(dglResp.data)) {
        setDigiLockerDocs(dglResp.data);
      }
    } catch (err) {
      console.error('Error fetching applicant data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setResubmitSuccessMap({});
  }, [currentRole]);

  const handleFileUpload = (appId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setResubmitFilesMap(prev => ({
        ...prev,
        [appId]: [
          ...(prev[appId] || []),
          {
            id: `resub-${Date.now()}`,
            docType: 'Income Certificate (Rectified)',
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            fileData: base64Data,
            status: 'PENDING',
            ocrExtracted: {
              candidateName: applicant?.name || 'Applicant',
              issuingAuthority: 'Tehsildar / District Magistrate',
              annualIncome: applicant?.annualIncome || 140000
            }
          }
        ]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (appId: string) => {
    const text = resubmitTextMap[appId] || '';
    const files = resubmitFilesMap[appId] || [];
    if (!text.trim() && files.length === 0) return;
    try {
      const resp = await api.resubmitDeficiency(appId, {
        explanation: text,
        newDocuments: files
      });
      if (resp.success) {
        setResubmitSuccessMap(prev => ({ ...prev, [appId]: true }));
        setResubmitTextMap(prev => ({ ...prev, [appId]: '' }));
        setResubmitFilesMap(prev => ({ ...prev, [appId]: [] }));
        setTimeout(() => {
          setResubmitSuccessMap(prev => ({ ...prev, [appId]: false }));
          loadData();
        }, 1200);
      }
    } catch (err) {
      console.error('Error resubmitting deficiency:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.75rem', color: '#1A4D8F' }} />
        <div style={{ fontSize: '0.875rem' }}>Loading your scholarship dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Clean Welcome Banner */}
      <div className="gov-card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #1A4D8F', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
                Welcome, {applicant?.name || 'Pooja Maravi'}
              </h2>
              <span className="badge badge-approved" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                Aadhaar e-KYC Verified
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: '0.35rem 0 0', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>Course: <strong>{applicant?.courseLevel || 'Ph.D Scholar'}</strong></span>
              <span>•</span>
              <span>Institute: <strong>{applicant?.instituteName || 'JNU'}</strong></span>
              <span>•</span>
              <span>Category: <strong>{(applicant?.category || 'PVTG').replace('_', ' ')}</strong></span>
            </p>
          </div>

          <button
            onClick={onOpenApplyModal}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <PlusCircle size={16} />
            <span>Apply for Scheme</span>
          </button>
        </div>
      </div>

      {/* DigiLocker Pre-Verified Digital Vault (FR-1.2, Section 5.4) */}
      {digiLockerDocs.length > 0 && (
        <div className="gov-card" style={{ padding: '1rem 1.25rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#166534', color: '#FFFFFF', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                DIGILOCKER
              </div>
              <h3 style={{ fontSize: '0.9375rem', color: '#166534', margin: 0, fontWeight: 700 }}>
                Pre-Verified Digital Locker Vault ({digiLockerDocs.length} Certificates Linked)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 500 }}>
              Tamper-Proof National Vault Link Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {digiLockerDocs.map((doc: any) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #DCFCE7',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A2540' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.15rem' }}>
                    Issued: {doc.issueDate} • {doc.issuer.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#15803D', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={11} /> Digitally Signed & Sealed
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const certNum = doc.verifiedData?.certificateNumber ||
                      (doc.docUri?.includes(':') ? doc.docUri.split(':').pop() : 'CG-CST-2021-BST-1109');
                    const docType = doc.docType ||
                      (doc.title?.toLowerCase().includes('caste') || doc.title?.toLowerCase().includes('tribe') ? 'CASTE_CERT' : 'INCOME_CERT');
                    setModalInspectionDossier({
                      document: {
                        id: doc.id,
                        docType: docType,
                        fileName: doc.title,
                        fileUrl: doc.docUri,
                        status: 'ACCEPTED',
                        ocrExtracted: {
                          candidateName: doc.verifiedData?.candidateName || applicant?.name || 'Applicant',
                          casteCategory: doc.verifiedData?.tribeName ? `${doc.verifiedData.tribeName} (Scheduled Tribe)` : (applicant?.category || 'Scheduled Tribe'),
                          certificateNumber: certNum,
                          issuingAuthority: doc.issuer,
                          issueDate: doc.issueDate,
                          annualIncome: doc.verifiedData?.annualIncome
                        },
                        discrepancyNote: null
                      },
                      applicant: applicant || undefined,
                      scheme: { name: 'Ministry of Tribal Affairs Statutory Registry', code: 'MOTA', incomeCeiling: 250000 }
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.6875rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: '#86EFAC', color: '#166534', backgroundColor: '#F0FDF4' }}
                >
                  <ShieldCheck size={12} />
                  <span>Verify Registry Certificate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
            My Scholarship & Fellowship Applications ({applications.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Academic Year 2026–2027
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="gov-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748B' }}>
            <FileText size={36} style={{ color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#0A2540', fontSize: '1rem', margin: '0 0 0.35rem' }}>No Applications Filed Yet</h4>
            <p style={{ fontSize: '0.8125rem', margin: '0 0 1rem', color: '#64748B' }}>
              Explore available schemes and file an application in minutes.
            </p>
            <button onClick={onOpenApplyModal} className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Start Application
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => {
              const isFlagged = app.status === 'DEFICIENCY_FLAGGED';
              const isDisbursed = app.status === 'DISBURSED';
              const isSelected = app.status === 'SELECTED' || isDisbursed;

              const isScrutinized = isSelected || app.status === 'VERIFIED' || app.status === 'SHORTLISTED' || app.currentStage.includes('SCRUTINY') || app.currentStage.includes('COMMITTEE') || app.currentStage.includes('FINALIZED');
              const isVerified = isSelected || app.status === 'VERIFIED' || app.status === 'SHORTLISTED' || app.currentStage.includes('COMMITTEE') || app.currentStage.includes('FINALIZED');

              const stages = [
                { id: 1, label: 'Submitted', active: true },
                { id: 2, label: isFlagged ? 'Deficiency' : 'Scrutiny', active: isFlagged || isScrutinized || app.status !== 'SUBMITTED', flagged: isFlagged },
                { id: 3, label: 'Verified', active: !isFlagged && isVerified },
                { id: 4, label: 'Selection', active: isSelected || app.currentStage.includes('COMMITTEE') || app.currentStage.includes('FINALIZED') },
                { id: 5, label: 'DBT Disbursed', active: isDisbursed }
              ];

              return (
                <div
                  key={app.id}
                  className="gov-card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderLeft: isFlagged ? '4px solid #C82333' : '4px solid #1A4D8F',
                    boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em' }}>
                        APPLICATION ID: {app.id}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#0A2540', margin: '0.2rem 0 0.15rem', fontWeight: 700 }}>
                        {app.schemeName} ({app.schemeCode})
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Level: {app.schemeLevel}
                      </div>
                    </div>

                    <StatusBadge status={app.status} />
                  </div>

                  {/* Clean Horizontal Stepper */}
                  <div style={{ margin: '1.25rem 0', padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {stages.map((stage, idx) => (
                        <React.Fragment key={stage.id}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 2 }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: stage.flagged ? '#EF4444' : stage.active ? '#1A4D8F' : '#CBD5E1',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6875rem',
                                fontWeight: 700
                              }}
                            >
                              {stage.flagged ? '!' : stage.active ? '✓' : stage.id}
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: stage.active ? '#0A2540' : '#94A3B8', fontWeight: stage.active ? 600 : 400 }}>
                              {stage.label}
                            </span>
                          </div>

                          {idx < stages.length - 1 && (
                            <div
                              style={{
                                flex: 1,
                                height: '2px',
                                backgroundColor: stages[idx + 1].active ? '#1A4D8F' : '#E2E8F0',
                                margin: '0 0.5rem',
                                marginBottom: '1.1rem'
                              }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Explainable Status */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: isFlagged ? '#FEF2F2' : '#F1F5F9',
                    border: `1px solid ${isFlagged ? '#FECACA' : '#E2E8F0'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem'
                  }}>
                    {isFlagged ? (
                      <AlertTriangle size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Clock size={18} style={{ color: '#1A4D8F', flexShrink: 0, marginTop: '2px' }} />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <strong style={{ color: isFlagged ? '#991B1B' : '#0A2540' }}>
                          Status Update:
                        </strong>
                        <span style={{ color: '#64748B' }}>
                          AI Confidence: <strong>{app.aiDiscrepancyScore}%</strong>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#334155', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                        {app.explainableStatus}
                      </p>

                      {isFlagged && app.deficiencyReason && (
                        <div style={{
                          marginTop: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: '#FFFFFF',
                          borderLeft: '4px solid #DC2626',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600, flex: 1 }}>
                            <strong>Action Required:</strong> {app.deficiencyReason}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSahayakModal({
                              isOpen: true,
                              applicantName: applicant?.name || 'Applicant',
                              deficiencyReason: app.deficiencyReason || ''
                            })}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              backgroundColor: '#FEF3C7',
                              borderColor: '#F59E0B',
                              color: '#92400E',
                              fontWeight: 700
                            }}
                          >
                            <Volume2 size={15} style={{ color: '#D97706' }} /> Jan-Jatiya Sahayak • Listen in Native Dialect
                          </button>
                        </div>
                      )}

                      {/* AISHE Institutional Anti-Fraud & Dual Escrow Card */}
                      <div style={{ marginTop: '0.85rem' }}>
                        <AisheEscrowCard
                          schemeCode={app.schemeCode}
                          totalAwardAmount={app.schemeCode === 'ARG43' ? 250000 : app.schemeCode === 'ARG45' ? 480000 : 120000}
                          instituteName={app.instituteName}
                          aadhaarMasked={app.aadhaarMasked}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submitted Application Documents & AI Inspection Dossier */}
                  {app.documents && app.documents.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0A2540', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={13} /> Submitted Application Documents & AI Inspection Dossier ({app.documents.length}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {app.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            style={{
                              padding: '0.55rem 0.75rem',
                              borderRadius: '4px',
                              border: `1px solid ${doc.status === 'DEFICIENCY_FLAGGED' ? '#FCA5A5' : '#E2E8F0'}`,
                              backgroundColor: doc.status === 'DEFICIENCY_FLAGGED' ? '#FEF2F2' : '#F8FAFC',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.75rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: doc.status === 'DEFICIENCY_FLAGGED' ? '#991B1B' : '#0A2540' }}>
                                {doc.docType}: {doc.fileName}
                              </div>
                              {doc.ocrExtracted && (
                                <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.15rem' }}>
                                  Extracted Name: <strong>{doc.ocrExtracted.candidateName}</strong>
                                  {(doc.ocrExtracted.annualIncome != null || doc.ocrExtracted.annualIncomeInr != null) && (
                                    <span style={{ fontWeight: 600, color: doc.status === 'DEFICIENCY_FLAGGED' ? '#DC2626' : '#166534', marginLeft: '0.35rem' }}>
                                      • Income: ₹{(doc.ocrExtracted.annualIncome ?? doc.ocrExtracted.annualIncomeInr).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  {doc.ocrExtracted.casteCategory && (
                                    <span style={{ marginLeft: '0.35rem' }}>• Category: {doc.ocrExtracted.casteCategory}</span>
                                  )}
                                </div>
                              )}
                              {doc.discrepancyNote && (
                                <div style={{ fontSize: '0.6875rem', color: '#B91C1C', marginTop: '0.2rem', fontWeight: 500 }}>
                                  ⚠️ {doc.discrepancyNote}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setModalInspectionDossier({
                                document: doc,
                                applicant: applicant || undefined,
                                scheme: { name: app.schemeName, code: app.schemeCode, incomeCeiling: app.incomeCeiling || 250000 },
                                applicationId: app.id
                              })}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.6875rem',
                                padding: '0.25rem 0.55rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                borderColor: doc.status === 'DEFICIENCY_FLAGGED' ? '#FCA5A5' : '#CBD5E1',
                                color: doc.status === 'DEFICIENCY_FLAGGED' ? '#B91C1C' : '#1E293B',
                                backgroundColor: '#FFFFFF',
                                flexShrink: 0
                              }}
                            >
                              <FileSearch size={12} />
                              <span>Inspect & Verify Document</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deficiency Resubmission Form */}
                  {isFlagged && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '5px' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RefreshCw size={14} /> Provide Clarification / Updated Document Reference
                      </div>

                      {resubmitSuccessMap[app.id] ? (
                        <div style={{ color: '#166534', backgroundColor: '#DCFCE7', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={15} /> Clarification and documents submitted to scrutiny officer!
                        </div>
                      ) : (
                        <div>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            value={resubmitTextMap[app.id] || ''}
                            onChange={(e) => setResubmitTextMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                            placeholder="Enter clarification or note regarding the uploaded certificate..."
                            style={{ marginBottom: '0.5rem', fontSize: '0.8125rem' }}
                          />

                          <div style={{ marginBottom: '0.65rem', padding: '0.5rem', backgroundColor: '#FEF3C7', borderRadius: '4px', border: '1px dashed #D97706' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Upload size={13} /> Attach Rectified Certificate / Supporting Proof (PDF or Image):
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(e) => handleFileUpload(app.id, e)}
                              style={{ fontSize: '0.75rem', marginTop: '0.35rem', width: '100%' }}
                            />
                            {(resubmitFilesMap[app.id] || []).length > 0 && (
                              <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#166534', fontWeight: 500 }}>
                                ✓ Ready to submit: {(resubmitFilesMap[app.id] || []).map(f => f.fileName).join(', ')}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleResubmit(app.id)}
                              className="btn btn-primary btn-sm"
                              disabled={!(resubmitTextMap[app.id] || '').trim() && (resubmitFilesMap[app.id] || []).length === 0}
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Send size={13} /> Submit Clarification & Documents
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statutory e-District Certificate Verification Modal */}
      {modalInspectionDossier && (
        <DocumentVerificationModal
          isOpen={!!modalInspectionDossier}
          onClose={() => setModalInspectionDossier(null)}
          document={modalInspectionDossier.document}
          applicant={modalInspectionDossier.applicant}
          scheme={modalInspectionDossier.scheme}
          applicationId={modalInspectionDossier.applicationId}
        />
      )}

      {/* Jan-Jatiya Sahayak Multilingual Audio & Fix Guidance Modal */}
      {sahayakModal && sahayakModal.isOpen && (
        <JanJatiyaSahayakModal
          isOpen={sahayakModal.isOpen}
          onClose={() => setSahayakModal(null)}
          applicantName={sahayakModal.applicantName}
          deficiencyReason={sahayakModal.deficiencyReason}
        />
      )}
    </div>
  );
};
