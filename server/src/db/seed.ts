import { getDb } from './connection.js';

export function runSeed(db = getDb()) {
  console.log('Seeding MoTA Scheme Management System database...');

  // 1. Seed Schemes
  const insertScheme = db.prepare(`
    INSERT OR REPLACE INTO schemes (
      id, code, name, level, description, legacy_portal,
      income_ceiling, age_ceiling, academic_threshold, quota_type, total_slots,
      selection_method, reservation_waterfall, document_checklist,
      verification_hierarchy, disbursement_frequency, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const schemes = [
    {
      id: 'scheme-pre-matric',
      code: 'BPVGK',
      name: 'Pre-Matric Scholarship for ST Students',
      level: 'Class IX - X',
      description: 'Centrally sponsored scheme for ST students studying in classes IX & X to minimize dropout rates.',
      legacyPortal: 'dbttribal.gov.in',
      incomeCeiling: 250000,
      ageCeiling: null,
      academicThreshold: null,
      quotaType: 'UNCAPPED',
      totalSlots: null,
      selectionMethod: 'AUTO_GATE',
      reservationWaterfall: JSON.stringify([]),
      documentChecklist: JSON.stringify([
        { docType: 'CASTE_CERT', title: 'Valid ST Community Certificate', required: true },
        { docType: 'INCOME_CERT', title: 'Competent Authority Income Certificate (≤ ₹2.5L)', required: true },
        { docType: 'PREV_MARKSHEET', title: 'Previous Class Marksheet', required: true },
        { docType: 'BANK_PASSBOOK', title: 'Aadhaar-Seeded Bank Passbook / Mandate', required: true }
      ]),
      verificationHierarchy: JSON.stringify(['INO', 'STATE_NODAL']),
      disbursementFrequency: 'ANNUAL',
      isActive: 1
    },
    {
      id: 'scheme-post-matric',
      code: 'BVOBC',
      name: 'Post-Matric Scholarship for ST Students',
      level: 'Class XI to Post-Graduate',
      description: 'Comprehensive financial assistance for higher secondary, undergraduate, and post-graduate ST students.',
      legacyPortal: 'dbttribal.gov.in',
      incomeCeiling: 250000,
      ageCeiling: null,
      academicThreshold: null,
      quotaType: 'UNCAPPED',
      totalSlots: null,
      selectionMethod: 'AUTO_GATE',
      reservationWaterfall: JSON.stringify([]),
      documentChecklist: JSON.stringify([
        { docType: 'CASTE_CERT', title: 'Valid ST Community Certificate', required: true },
        { docType: 'INCOME_CERT', title: 'Annual Income Certificate (≤ ₹2.5L)', required: true },
        { docType: 'FEE_RECEIPT', title: 'Current Year Admission / Fee Receipt', required: true },
        { docType: 'PREV_MARKSHEET', title: 'Last Qualifying Examination Marksheet', required: true },
        { docType: 'BANK_PASSBOOK', title: 'Aadhaar-Seeded Bank Account Passbook', required: true }
      ]),
      verificationHierarchy: JSON.stringify(['INO', 'STATE_NODAL']),
      disbursementFrequency: 'ANNUAL',
      isActive: 1
    },
    {
      id: 'scheme-top-class',
      code: 'A023B',
      name: 'National Fellowship & Scholarship for Higher Education (Top Class Education)',
      level: 'Undergraduate / Post-Graduate in 252 Notified Institutes',
      description: 'Full financial support for meritorious ST students admitted to notified premier institutes (IITs, IIMs, NITs, AIIMS, NLUs).',
      legacyPortal: 'scholarships.gov.in (NSP)',
      incomeCeiling: 600000,
      ageCeiling: null,
      academicThreshold: null,
      quotaType: 'UNCAPPED',
      totalSlots: null,
      selectionMethod: 'AUTO_GATE',
      reservationWaterfall: JSON.stringify([]),
      documentChecklist: JSON.stringify([
        { docType: 'CASTE_CERT', title: 'Valid ST Certificate', required: true },
        { docType: 'INCOME_CERT', title: 'Income Certificate (≤ ₹6.0L)', required: true },
        { docType: 'ALLOTMENT_LETTER', title: 'Admission / Seat Allotment Letter in Notified Institute', required: true },
        { docType: 'FEE_STRUCTURE', title: 'Institute Verified Fee Structure Breakdown', required: true },
        { docType: 'BANK_PASSBOOK', title: 'Student Bank Account Details', required: true }
      ]),
      verificationHierarchy: JSON.stringify(['INO', 'MOTA_ADMIN']),
      disbursementFrequency: 'ANNUAL',
      isActive: 1
    },
    {
      id: 'scheme-nfst',
      code: 'ARG45',
      name: 'National Fellowship for Higher Education of ST Students (NFST)',
      level: 'M.Phil / Ph.D in Indian Universities',
      description: 'Competitive fellowship for 750 ST scholars pursuing M.Phil / Ph.D research degrees with 4-tier reservation waterfall.',
      legacyPortal: 'fellowship.tribal.gov.in',
      incomeCeiling: null,
      ageCeiling: 36,
      academicThreshold: 55,
      quotaType: 'FIXED_SLOTS',
      totalSlots: 750,
      selectionMethod: 'MERIT_WATERFALL',
      reservationWaterfall: JSON.stringify([
        { tier: 'DIVYANGJAN', label: 'Divyangjan (PwD ≥ 40%)', priority: 1, allocatedSlots: 38, spilloverTargetTier: 'PVTG' },
        { tier: 'PVTG', label: 'Particularly Vulnerable Tribal Groups (PVTG)', priority: 2, allocatedSlots: 75, spilloverTargetTier: 'FEMALE_ST' },
        { tier: 'FEMALE_ST', label: 'Female ST Candidates (30% Sub-quota)', priority: 3, allocatedSlots: 225, spilloverTargetTier: 'ST_GENERAL' },
        { tier: 'ST_GENERAL', label: 'Open Scheduled Tribe (ST Others)', priority: 4, allocatedSlots: 412, spilloverTargetTier: null }
      ]),
      documentChecklist: JSON.stringify([
        { docType: 'CASTE_CERT', title: 'Valid ST Certificate (PVTG endorsement if applicable)', required: true },
        { docType: 'PWD_CERT', title: 'Disability Certificate (if PwD)', required: false },
        { docType: 'MPHIL_PHD_REG', title: 'Proof of Admission / Registration in M.Phil / Ph.D', required: true },
        { docType: 'RESEARCH_SYNOPSIS', title: 'Research Synopsis approved by Research Guide', required: true },
        { docType: 'PG_MARKSHEET', title: 'Post-Graduate Degree Marksheet (Min 55%)', required: true }
      ]),
      verificationHierarchy: JSON.stringify(['INO', 'MOTA_ADMIN', 'SELECTION_COMMITTEE']),
      disbursementFrequency: 'QUARTERLY',
      isActive: 1
    },
    {
      id: 'scheme-nos',
      code: 'AZKMI',
      name: 'National Overseas Scholarship for ST Candidates (NOS)',
      level: 'Master’s / Ph.D / Post-Doctoral Abroad',
      description: 'Prestigious scholarship for 20 ST scholars to pursue overseas education in QS World Ranked top universities.',
      legacyPortal: 'overseas.tribal.gov.in',
      incomeCeiling: 600000,
      ageCeiling: 35,
      academicThreshold: 55,
      quotaType: 'FIXED_SLOTS',
      totalSlots: 20,
      selectionMethod: 'TIERED_PRIORITY',
      reservationWaterfall: JSON.stringify([
        { tier: 'PRIORITY_1', label: 'Unconditional Admission in QS Top-1000 University', priority: 1, allocatedSlots: 12 },
        { tier: 'PRIORITY_2', label: 'Offer Letter with Conditions / Language Requirements', priority: 2, allocatedSlots: 5 },
        { tier: 'PRIORITY_3', label: 'Standard Applications & Selection Committee Interview', priority: 3, allocatedSlots: 3 }
      ]),
      documentChecklist: JSON.stringify([
        { docType: 'CASTE_CERT', title: 'Valid ST Certificate', required: true },
        { docType: 'INCOME_CERT', title: 'Family Income Certificate (≤ ₹6.0L)', required: true },
        { docType: 'OVERSEAS_OFFER', title: 'Unconditional Admission Letter from Foreign University', required: true },
        { docType: 'PASSPORT', title: 'Valid Indian Passport', required: true },
        { docType: 'GRE_IELTS_SCORE', title: 'Standardized Exam Scorecard (IELTS/TOEFL/GRE)', required: true }
      ]),
      verificationHierarchy: JSON.stringify(['MOTA_ADMIN', 'SELECTION_COMMITTEE']),
      disbursementFrequency: 'SEMESTER_FOREX',
      isActive: 1
    }
  ];

  for (const s of schemes) {
    insertScheme.run(
      s.id, s.code, s.name, s.level, s.description, s.legacyPortal,
      s.incomeCeiling, s.ageCeiling, s.academicThreshold, s.quotaType, s.totalSlots,
      s.selectionMethod, s.reservationWaterfall, s.documentChecklist,
      s.verificationHierarchy, s.disbursementFrequency, s.isActive
    );
  }

  // 2. Seed QS Top Universities for NOS
  const insertUni = db.prepare(`
    INSERT OR REPLACE INTO qs_universities (rank, name, country, city)
    VALUES (?, ?, ?, ?)
  `);

  const universities = [
    { rank: 1, name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', city: 'Cambridge' },
    { rank: 2, name: 'Imperial College London', country: 'United Kingdom', city: 'London' },
    { rank: 3, name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford' },
    { rank: 4, name: 'Harvard University', country: 'United States', city: 'Cambridge' },
    { rank: 5, name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge' },
    { rank: 6, name: 'Stanford University', country: 'United States', city: 'Stanford' },
    { rank: 7, name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich' },
    { rank: 8, name: 'National University of Singapore (NUS)', country: 'Singapore', city: 'Singapore' },
    { rank: 9, name: 'UCL (University College London)', country: 'United Kingdom', city: 'London' },
    { rank: 10, name: 'California Institute of Technology (Caltech)', country: 'United States', city: 'Pasadena' },
    { rank: 14, name: 'The University of Melbourne', country: 'Australia', city: 'Melbourne' },
    { rank: 21, name: 'University of Toronto', country: 'Canada', city: 'Toronto' },
    { rank: 32, name: 'The University of Manchester', country: 'United Kingdom', city: 'Manchester' },
    { rank: 45, name: 'Technical University of Munich', country: 'Germany', city: 'Munich' },
    { rank: 82, name: 'Indian Institute of Technology Bombay (IITB)', country: 'India', city: 'Mumbai' },
    { rank: 150, name: 'Indian Institute of Science (IISc)', country: 'India', city: 'Bengaluru' }
  ];

  for (const u of universities) {
    insertUni.run(u.rank, u.name, u.country, u.city);
  }

  // 3. Seed Realistic Applicants
  const insertApplicant = db.prepare(`
    INSERT OR REPLACE INTO applicants (
      id, name, email, phone, aadhaar_masked, aadhaar_hash,
      category, is_pwd, is_pvtg, gender, annual_income,
      state, district, institute_name, course_level, academic_percentage,
      bank_account_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applicants = [
    {
      id: 'app-user-01',
      name: 'Pooja Maravi',
      email: 'pooja.maravi@example.com',
      phone: '+91 98765 43210',
      aadhaarMasked: 'XXXX-XXXX-4123',
      aadhaarHash: 'hash_aadhaar_pooja_01',
      category: 'PVTG',
      isPwD: 0,
      isPVTG: 1,
      gender: 'FEMALE',
      annualIncome: 140000,
      state: 'Madhya Pradesh',
      district: 'Dindori',
      instituteName: 'Jawaharlal Nehru University, New Delhi',
      courseLevel: 'Ph.D in Tribal Ethnography',
      academicPercentage: 74.5,
      bankAccountHash: 'bank_hash_sbi_4412'
    },
    {
      id: 'app-user-02',
      name: 'Ramesh Kumar Oraon',
      email: 'ramesh.oraon@example.com',
      phone: '+91 94311 88231',
      aadhaarMasked: 'XXXX-XXXX-9871',
      aadhaarHash: 'hash_aadhaar_ramesh_02',
      category: 'ST_OTHER',
      isPwD: 0,
      isPVTG: 0,
      gender: 'MALE',
      annualIncome: 240000,
      state: 'Jharkhand',
      district: 'Ranchi',
      instituteName: 'St. Xavier’s College, Ranchi',
      courseLevel: 'Class XII (Science)',
      academicPercentage: 81.2,
      bankAccountHash: 'bank_hash_pnb_9182'
    },
    {
      id: 'app-user-03',
      name: 'Sunita Soren',
      email: 'sunita.soren@example.com',
      phone: '+91 91234 56789',
      aadhaarMasked: 'XXXX-XXXX-6543',
      aadhaarHash: 'hash_aadhaar_sunita_03',
      category: 'FEMALE_ST',
      isPwD: 0,
      isPVTG: 0,
      gender: 'FEMALE',
      annualIncome: 420000,
      state: 'Odisha',
      district: 'Mayurbhanj',
      instituteName: 'University of Oxford',
      courseLevel: 'M.Sc in Environmental Change and Management',
      academicPercentage: 78.0,
      bankAccountHash: 'bank_hash_hdfc_5531'
    },
    {
      id: 'app-user-04',
      name: 'Kailash Birhor',
      email: 'kailash.birhor@example.com',
      phone: '+91 97711 22334',
      aadhaarMasked: 'XXXX-XXXX-8822',
      aadhaarHash: 'hash_aadhaar_kailash_04',
      category: 'DIVYANGJAN',
      isPwD: 1,
      isPVTG: 1,
      gender: 'MALE',
      annualIncome: 95000,
      state: 'Jharkhand',
      district: 'Hazaribagh',
      instituteName: 'Banaras Hindu University',
      courseLevel: 'Ph.D in Botany',
      academicPercentage: 68.4,
      bankAccountHash: 'bank_hash_bob_3311'
    },
    {
      id: 'app-user-05',
      name: 'Amitabh Gond',
      email: 'amitabh.gond@example.com',
      phone: '+91 99887 76655',
      aadhaarMasked: 'XXXX-XXXX-1199',
      aadhaarHash: 'hash_aadhaar_amitabh_05',
      category: 'ST_OTHER',
      isPwD: 0,
      isPVTG: 0,
      gender: 'MALE',
      annualIncome: 240000, // Note: Income cert in seed docs will show 280000 for AI discrepancy demonstration
      state: 'Chhattisgarh',
      district: 'Bastar',
      instituteName: 'National Institute of Technology, Raipur',
      courseLevel: 'B.Tech in Computer Science',
      academicPercentage: 86.2,
      bankAccountHash: 'bank_hash_sbi_9981'
    }
  ];

  for (const a of applicants) {
    insertApplicant.run(
      a.id, a.name, a.email, a.phone, a.aadhaarMasked, a.aadhaarHash,
      a.category, a.isPwD, a.isPVTG, a.gender, a.annualIncome,
      a.state, a.district, a.instituteName, a.courseLevel, a.academicPercentage,
      a.bankAccountHash
    );
  }

  // 4. Seed Applications & Document Scenarios
  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, applicant_id, scheme_id, academic_year, status, current_stage,
      submitted_at, form_data, explainable_status, deficiency_reason, ai_discrepancy_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDoc = db.prepare(`
    INSERT OR REPLACE INTO documents (
      id, application_id, doc_type, file_name, file_url,
      ocr_extracted, status, discrepancy_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Application 1: Pooja Maravi -> NFST (Eligible, Shortlisted, Demonstrates Waterfall)
  insertApp.run(
    'appln-nfst-01',
    'app-user-01',
    'scheme-nfst',
    '2026-2027',
    'SHORTLISTED',
    'COMMITTEE_REVIEW',
    '2026-09-02T10:30:00Z',
    JSON.stringify({
      phdTopic: 'Ethnobotany & Indigenous Livelihoods in Baiga Chak',
      guideName: 'Prof. Ananya Sen',
      registrationDate: '2025-08-15'
    }),
    'Application verified by INO and MoTA Scrutiny. Shortlisted under PVTG Priority Bucket for Final Selection Committee sign-off.',
    null,
    98.5
  );

  insertDoc.run(
    'doc-01-caste',
    'appln-nfst-01',
    'CASTE_CERT',
    'pooja_pvtg_baiga_certificate.pdf',
    '/uploads/pooja_caste.pdf',
    JSON.stringify({
      candidateName: 'Pooja Maravi',
      tribe: 'Baiga (PVTG)',
      issuingAuthority: 'Sub-Divisional Officer, Dindori (MP)',
      validity: 'Permanent'
    }),
    'ACCEPTED',
    null
  );

  // Application 2: Ramesh Oraon -> Post-Matric (Approved, DBT Disbursed)
  insertApp.run(
    'appln-postmatric-02',
    'app-user-02',
    'scheme-post-matric',
    '2026-2027',
    'DISBURSED',
    'DISBURSEMENT',
    '2026-08-20T14:15:00Z',
    JSON.stringify({
      currentStandard: 'Class XII (Science)',
      annualTuitionFee: 12500
    }),
    'Annual DBT of ₹12,500 successfully credited to Aadhaar-linked Bank Account via PFMS-DBT transaction TXN981240182.',
    null,
    99.2
  );

  // Application 3: Sunita Soren -> NOS (Priority Tier 1: Oxford University QS Rank #3)
  insertApp.run(
    'appln-nos-03',
    'app-user-03',
    'scheme-nos',
    '2026-2027',
    'SHORTLISTED',
    'SELECTION_FINALIZED',
    '2026-09-05T09:00:00Z',
    JSON.stringify({
      university: 'University of Oxford',
      qsRank: 3,
      course: 'M.Sc Environmental Change',
      admissionStatus: 'Unconditional Offer Letter',
      annualLivingAllowanceGbp: 15400
    }),
    'Qualified under Priority Tier 1 (QS World Ranking #3). Forex allowance calculated for GBP £15,400/yr. Awaiting Indian Mission dispatch.',
    null,
    97.8
  );

  // Application 4: Kailash Birhor -> NFST (PwD/Divyangjan Tier 1)
  insertApp.run(
    'appln-nfst-04',
    'app-user-04',
    'scheme-nfst',
    '2026-2027',
    'SHORTLISTED',
    'COMMITTEE_REVIEW',
    '2026-09-08T11:45:00Z',
    JSON.stringify({
      phdTopic: 'Genetic Preservation of Medicinal Flora in Chota Nagpur',
      pwdPercentage: 60,
      disabilityType: 'Locomotor'
    }),
    'Shortlisted under Divyangjan (PwD ≥ 40%) Reservation Tier 1. Full 5-year fellowship provision allocated.',
    null,
    99.0
  );

  // Application 5: Amitabh Gond -> Post-Matric (Deficiency Flagged: Income Discrepancy detected by AI)
  insertApp.run(
    'appln-postmatric-05',
    'app-user-05',
    'scheme-post-matric',
    '2026-2027',
    'DEFICIENCY_FLAGGED',
    'INO_SCRUTINY',
    '2026-09-12T16:20:00Z',
    JSON.stringify({
      claimedAnnualIncome: 240000,
      institute: 'NIT Raipur'
    }),
    'Discrepancy Flagged: Uploaded Income Certificate shows ₹2,80,000, whereas Application Form states ₹2,40,000. Document exceeds the ₹2.5L statutory cap for Post-Matric.',
    'Discrepancy: Income Certificate states ₹2,80,000, exceeding the scheme cap of ₹2,50,000. Please clarify or provide the latest competent authority certificate.',
    42.0
  );

  insertDoc.run(
    'doc-05-income',
    'appln-postmatric-05',
    'INCOME_CERT',
    'amitabh_income_cert_2026.pdf',
    '/uploads/amitabh_income.pdf',
    JSON.stringify({
      nameOnCertificate: 'Amitabh Gond',
      annualIncomeInr: 280000,
      issuingTehsil: 'Jagdalpur, Bastar',
      discrepancyFlag: 'EXCEEDS_INCOME_CEILING_AND_MISMATCH'
    }),
    'DEFICIENCY_FLAGGED',
    'Extracted income ₹2,80,000 conflicts with form value ₹2,40,000 and exceeds the maximum permissible limit of ₹2,50,000 for Post-Matric.'
  );

  // 5. Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, entity_type, entity_id, actor, action, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('audit-01', 'APPLICATION', 'appln-nfst-01', 'INO_JNU_OFFICER', 'VERIFIED_PHYSICAL_DOCUMENTS', 'All original caste and fellowship registration certificates verified successfully.', '2026-09-03T11:00:00Z');
  insertAudit.run('audit-02', 'APPLICATION', 'appln-postmatric-05', 'AI_INTELLIGENCE_SERVICE', 'DETECTED_DISCREPANCY', 'Gemini OCR detected income mismatch: Form ₹2.4L vs Document ₹2.8L.', '2026-09-12T16:21:00Z');
  insertAudit.run('audit-03', 'APPLICATION', 'appln-nos-03', 'MOTA_SELECTION_COMMITTEE', 'QS_TIER_1_ENDORSEMENT', 'Candidate admission verified with Oxford admissions portal. Priority Tier 1 confirmed.', '2026-09-06T15:30:00Z');

  console.log('Database successfully seeded with 5 Schemes, QS Universities, Applicants, and Discrepancy Scenarios.');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed();
}
