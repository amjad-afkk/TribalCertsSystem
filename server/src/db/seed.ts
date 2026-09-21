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
        { docType: 'INCOME_CERT', title: 'Competent Authority Income Certificate (â‰¤ â‚¹2.5L)', required: true },
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
        { docType: 'INCOME_CERT', title: 'Annual Income Certificate (â‰¤ â‚¹2.5L)', required: true },
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
        { docType: 'INCOME_CERT', title: 'Income Certificate (â‰¤ â‚¹6.0L)', required: true },
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
        { tier: 'DIVYANGJAN', label: 'Divyangjan (PwD â‰¥ 40%)', priority: 1, allocatedSlots: 38, spilloverTargetTier: 'PVTG' },
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
      level: 'Masterâ€™s / Ph.D / Post-Doctoral Abroad',
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
        { docType: 'INCOME_CERT', title: 'Family Income Certificate (â‰¤ â‚¹6.0L)', required: true },
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
      instituteName: 'St. Xavierâ€™s College, Ranchi',
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

  // 4. Seed Realistic Applications for Demonstration
  const insertApplication = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, applicant_id, scheme_id, academic_year, status, current_stage,
      submitted_at, form_data, explainable_status, deficiency_reason, ai_discrepancy_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applications = [
    {
      id: 'appln-nfst-01',
      applicantId: 'app-user-01',
      schemeId: 'scheme-nfst',
      academicYear: '2026-2027',
      status: 'SHORTLISTED',
      currentStage: 'COMMITTEE_REVIEW',
      submittedAt: '2026-08-14T10:30:00.000Z',
      formData: JSON.stringify({
        candidateName: 'Pooja Maravi',
        phdTopic: 'Ethnobotany and Indigenous Healing Systems of the Baiga Community',
        guideName: 'Prof. Ananya Sen, School of Social Sciences, JNU',
        institute: 'Jawaharlal Nehru University, New Delhi'
      }),
      explainableStatus: 'Application verified by INO and MoTA Scrutiny. Shortlisted under PVTG Priority Bucket for Final Selection Committee sign-off.',
      deficiencyReason: null,
      aiDiscrepancyScore: 98.5
    },
    {
      id: 'appln-postmatric-02',
      applicantId: 'app-user-02',
      schemeId: 'scheme-post-matric',
      academicYear: '2026-2027',
      status: 'DISBURSED',
      currentStage: 'DISBURSEMENT',
      submittedAt: '2026-07-20T14:15:00.000Z',
      formData: JSON.stringify({
        candidateName: 'Ramesh Kumar Oraon',
        courseName: 'Higher Secondary (Science Stream)',
        institute: 'St. Xavier’s College, Ranchi'
      }),
      explainableStatus: 'Annual DBT of ₹12,500 successfully credited to Aadhaar-linked Bank Account via PFMS-DBT transaction TXN981240182.',
      deficiencyReason: null,
      aiDiscrepancyScore: 99.0
    },
    {
      id: 'appln-nos-03',
      applicantId: 'app-user-03',
      schemeId: 'scheme-nos',
      academicYear: '2026-2027',
      status: 'SHORTLISTED',
      currentStage: 'SELECTION_FINALIZED',
      submittedAt: '2026-06-11T09:45:00.000Z',
      formData: JSON.stringify({
        candidateName: 'Sunita Soren',
        foreignUniversity: 'University of Oxford',
        qsRank: 3,
        courseName: 'M.Sc in Environmental Change and Management',
        maintenanceCurrency: 'GBP'
      }),
      explainableStatus: 'Qualified under Priority Tier 1 (QS World Ranking #3). Forex allowance calculated for GBP £15,400/yr. Awaiting Indian Mission dispatch.',
      deficiencyReason: null,
      aiDiscrepancyScore: 99.4
    },
    {
      id: 'appln-nfst-04',
      applicantId: 'app-user-04',
      schemeId: 'scheme-nfst',
      academicYear: '2026-2027',
      status: 'SHORTLISTED',
      currentStage: 'COMMITTEE_REVIEW',
      submittedAt: '2026-08-05T11:20:00.000Z',
      formData: JSON.stringify({
        candidateName: 'Kailash Birhor',
        phdTopic: 'Taxonomic Classification of Medicinal Flora in Chota Nagpur Plateau',
        guideName: 'Dr. V. K. Singh, Department of Botany, BHU',
        institute: 'Banaras Hindu University'
      }),
      explainableStatus: 'Shortlisted under Divyangjan (PwD ≥ 40%) Reservation Tier 1. Full 5-year fellowship provision allocated.',
      deficiencyReason: null,
      aiDiscrepancyScore: 97.8
    },
    {
      id: 'appln-postmatric-05',
      applicantId: 'app-user-05',
      schemeId: 'scheme-post-matric',
      academicYear: '2026-2027',
      status: 'DEFICIENCY_FLAGGED',
      currentStage: 'INO_SCRUTINY',
      submittedAt: '2026-09-02T16:00:00.000Z',
      formData: JSON.stringify({
        candidateName: 'Amitabh Gond',
        courseName: 'B.Tech in Computer Science',
        claimedIncome: 240000,
        institute: 'National Institute of Technology, Raipur'
      }),
      explainableStatus: 'Discrepancy Flagged: Uploaded Income Certificate shows ₹2,80,000, whereas Application Form states ₹2,40,000. Document exceeds the ₹2.5L statutory cap for Post-Matric.',
      deficiencyReason: 'Discrepancy: Income Certificate states ₹2,80,000, exceeding the scheme cap of ₹2,50,000. Please clarify or provide the latest competent authority certificate.',
      aiDiscrepancyScore: 45.0
    }
  ];

  for (const app of applications) {
    insertApplication.run(
      app.id, app.applicantId, app.schemeId, app.academicYear,
      app.status, app.currentStage, app.submittedAt, app.formData,
      app.explainableStatus, app.deficiencyReason, app.aiDiscrepancyScore
    );
  }

  // 5. Seed Demo Documents
  const insertDoc = db.prepare(`
    INSERT OR REPLACE INTO documents (
      id, application_id, doc_type, file_name, file_url,
      ocr_extracted, status, discrepancy_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const documents = [
    {
      id: 'doc-01-caste',
      applicationId: 'appln-nfst-01',
      docType: 'CASTE_CERT',
      fileName: 'pooja_pvtg_baiga_certificate.pdf',
      fileUrl: '/uploads/sample_caste_cert.pdf',
      ocrExtracted: JSON.stringify({
        candidateName: 'Pooja Maravi',
        casteCategory: 'Baiga (Particularly Vulnerable Tribal Group)',
        issueDate: '2022-06-18',
        issuingAuthority: 'Sub-Divisional Officer (Civil), Revenue Division',
        rawConfidence: 98.8
      }),
      status: 'ACCEPTED',
      discrepancyNote: null
    },
    {
      id: 'doc-05-income',
      applicationId: 'appln-postmatric-05',
      docType: 'INCOME_CERT',
      fileName: 'amitabh_income_cert_2026.pdf',
      fileUrl: '/uploads/sample_income_cert.pdf',
      ocrExtracted: JSON.stringify({
        candidateName: 'Amitabh Gond',
        annualIncome: 280000,
        issueDate: '2026-04-10',
        issuingAuthority: 'Office of the Tehsildar & Executive Magistrate',
        rawConfidence: 97.4
      }),
      status: 'DEFICIENCY_FLAGGED',
      discrepancyNote: 'Extracted income ₹2,80,000 conflicts with form value ₹2,40,000 and exceeds the maximum permissible limit of ₹2,50,000 for Post-Matric.'
    }
  ];

  for (const doc of documents) {
    insertDoc.run(
      doc.id, doc.applicationId, doc.docType, doc.fileName, doc.fileUrl,
      doc.ocrExtracted, doc.status, doc.discrepancyNote
    );
  }

  // 6. Seed Post-Selection Fellowship Records (FR-7.1 to FR-7.5)
  const insertFellowship = db.prepare(`
    INSERT OR REPLACE INTO fellowship_records (
      id, applicant_id, scheme_id, application_id, award_date, joining_deadline,
      joining_status, supervisor_name, joining_report_url, current_quarter,
      thesis_status, thesis_title, thesis_archive_id, final_disbursement_unlocked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Pooja Maravi: Shortlisted/Awarded NFST Fellowship
  // Award Date: 12 days ago, statutory 30-day joining window gives 18 days remaining
  const now = new Date();
  const awardDate = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
  const joiningDeadline = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString();

  insertFellowship.run(
    'flw-nfst-pooja-01',
    'app-user-01',
    'scheme-nfst',
    'appln-nfst-01',
    awardDate,
    joiningDeadline,
    'CONFIRMED',
    'Prof. Ananya Sen, School of Social Sciences, JNU',
    '/uploads/pooja_jnu_joining_report.pdf',
    4, // Year 1, Quarter 4 (awaiting thesis synopsis to unlock final disbursement)
    'NOT_SUBMITTED',
    'Ethnobotany and Indigenous Healing Systems of the Baiga Community',
    null,
    0
  );

  // 7. Seed Continuation Reports (FR-7.2)
  const insertContinuation = db.prepare(`
    INSERT OR REPLACE INTO continuation_reports (
      id, fellowship_id, quarter_number, academic_year, attendance_percentage,
      progress_summary, stipend_amount, pfms_transaction_id, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertContinuation.run(
    'cont-pooja-q1',
    'flw-nfst-pooja-01',
    1,
    '2025-2026',
    94.5,
    'Literature review on central Indian tribal herbal pharmacopoeia finalized and approved by Guide.',
    93000, // ₹31,000 * 3 months
    'PFMS-DBT-2025-991204',
    'DISBURSED',
    '2025-11-15T10:00:00.000Z'
  );

  insertContinuation.run(
    'cont-pooja-q2',
    'flw-nfst-pooja-01',
    2,
    '2025-2026',
    96.0,
    'Extensive ethnographic fieldwork completed across 14 Baiga settlements in Dindori and Mandla districts.',
    93000,
    'PFMS-DBT-2026-118402',
    'DISBURSED',
    '2026-02-20T11:30:00.000Z'
  );

  insertContinuation.run(
    'cont-pooja-q3',
    'flw-nfst-pooja-01',
    3,
    '2026-2027',
    92.0,
    'Taxonomic documentation of 82 rare medicinal plant species and preparation of herbarium specimens.',
    93000,
    'PFMS-DBT-2026-302911',
    'DISBURSED',
    '2026-06-10T09:15:00.000Z'
  );

  // 8. Seed DigiLocker Pre-verified Documents (FR-1.2)
  const insertDigiLocker = db.prepare(`
    INSERT OR REPLACE INTO digilocker_documents (
      id, applicant_id, doc_type, title, issuer, doc_uri, issue_date, verified_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDigiLocker.run(
    'dgl-pooja-caste',
    'app-user-01',
    'CASTE_CERT',
    'Scheduled Tribe Certificate (PVTG - Baiga)',
    'Sub-Divisional Officer (Civil), Revenue Division, Dindori, MP',
    'in.gov.mp.edistrict:caste:ST-2022-DND-4011',
    '2022-06-18',
    JSON.stringify({
      candidateName: 'Pooja Maravi',
      fatherName: 'Late Sh. Ramu Maravi',
      tribeName: 'Baiga (Particularly Vulnerable Tribal Group)',
      state: 'Madhya Pradesh',
      district: 'Dindori',
      digitalSignatureStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
      signingAuthority: 'SDO Civil Dindori Digital Key 0x9AF2'
    })
  );

  insertDigiLocker.run(
    'dgl-pooja-income',
    'app-user-01',
    'INCOME_CERT',
    'Annual Family Income Certificate (AY 2026-27)',
    'Office of the Tehsildar & Executive Magistrate, Dindori, MP',
    'in.gov.mp.edistrict:income:INC-2026-88192',
    '2026-04-15',
    JSON.stringify({
      candidateName: 'Pooja Maravi',
      annualIncome: 140000,
      incomeInWords: 'One Lakh Forty Thousand Only',
      financialYear: '2025-2026',
      validUntil: '2027-03-31',
      digitalSignatureStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
      signingAuthority: 'Tehsildar Dindori Public Seal'
    })
  );

  insertDigiLocker.run(
    'dgl-amitabh-caste',
    'app-user-05',
    'CASTE_CERT',
    'Scheduled Tribe Certificate (Gond Community)',
    'Sub-Divisional Magistrate, Bastar, Chhattisgarh',
    'in.gov.cg.edistrict:caste:ST-2021-BST-1109',
    '2021-08-12',
    JSON.stringify({
      candidateName: 'Amitabh Gond',
      tribeName: 'Gond',
      state: 'Chhattisgarh',
      district: 'Bastar',
      digitalSignatureStatus: 'CRYPTOGRAPHICALLY_VERIFIED'
    })
  );

  insertDigiLocker.run(
    'dgl-sunita-caste',
    'app-user-03',
    'CASTE_CERT',
    'Scheduled Tribe Certificate (Santhal Community)',
    'Revenue Officer, Mayurbhanj, Odisha',
    'in.gov.odisha.edistrict:caste:ST-2020-MBJ-7718',
    '2020-03-10',
    JSON.stringify({
      candidateName: 'Sunita Soren',
      tribeName: 'Santhal',
      state: 'Odisha',
      district: 'Mayurbhanj',
      digitalSignatureStatus: 'CRYPTOGRAPHICALLY_VERIFIED'
    })
  );

  // 9. Seed Notifications (SMS Alerts & WhatsApp Nudges - FR-4.6, FR-6.2, §6.8)
  const insertNotification = db.prepare(`
    INSERT OR REPLACE INTO notifications (
      id, recipient_id, channel, title, message, action_url, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    'notif-pooja-01',
    'app-user-01',
    'SMS',
    'Selection Committee Shortlist Confirmation',
    'MoTA Alert: Congratulations Pooja Maravi! Your NFST Fellowship application (ARG45) has been shortlisted under PVTG priority. Final sign-off scheduled.',
    '/applicant',
    0,
    new Date(Date.now() - 3600000 * 2).toISOString()
  );

  insertNotification.run(
    'notif-pooja-02',
    'app-user-01',
    'WHATSAPP',
    'Quarterly Fellowship Continuation Alert',
    'Namaste Pooja Ji! Your Q3 fellowship stipend (₹93,000) was credited via PFMS-DBT. Next step: Upload your Ph.D. thesis summary to repository.tribal.gov.in to release Q4 grant.',
    '/fellowship',
    0,
    new Date(Date.now() - 3600000 * 5).toISOString()
  );

  insertNotification.run(
    'notif-amitabh-01',
    'app-user-05',
    'WHATSAPP',
    'Immediate Action: Income Discrepancy Flagged',
    'Urgent MoTA Alert: Amitabh Gond, your Income Certificate shows ₹2,80,000, exceeding the Post-Matric ₹2.5L statutory cap. Please submit your clarification before 30th Sept to prevent rejection.',
    '/applicant',
    0,
    new Date(Date.now() - 3600000 * 8).toISOString()
  );

  console.log('Database seeded with 5 Schemes, QS Universities, 5 Applicants, 5 Applications, Fellowship Records, DigiLocker Docs, and Notifications.');
}

// Auto-run if executed directly (supports tsx and compiled node dist/db/seed.js)
if (process.argv[1] && /seed\.(ts|js)$/.test(process.argv[1])) {
  runSeed();
}



