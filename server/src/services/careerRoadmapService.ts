export interface CareerRoadmapProfile {
  category: string;
  courseLevel: string;
  academicPercentage: number;
  annualIncome: number;
  age: number;
  isPwD: boolean;
  isPVTG?: boolean;
}

export interface RoadmapMilestone {
  stage: string;
  title: string;
  schemeAlignment: string;
  keyBenefits: string[];
  actionRequired: string;
  estimatedFinancialSupport: string;
}

export interface ReservationEntitlement {
  title: string;
  ruleCitation: string;
  quotaDetails: string;
  benefitDescription: string;
}

export interface CareerGateway {
  sector: string;
  exams: string[];
  stPrivilege: string;
  preparationTip: string;
}

export interface TribalCareerRoadmapResult {
  candidateSummary: {
    categoryLabel: string;
    levelLabel: string;
    careerStage: string;
  };
  academicPath: RoadmapMilestone[];
  statutoryEntitlements: ReservationEntitlement[];
  careerGateways: CareerGateway[];
  documentationChecklist: string[];
}

export class CareerRoadmapService {
  static generateRoadmap(profile: CareerRoadmapProfile): TribalCareerRoadmapResult {
    const isST = profile.category !== 'GENERAL';
    const isPVTG = profile.category === 'PVTG' || !!profile.isPVTG;
    const isPwD = profile.isPwD || profile.category === 'DIVYANGJAN';

    // 1. Academic Pathway
    const academicPath: RoadmapMilestone[] = [];

    if (profile.courseLevel === 'Class IX-X') {
      academicPath.push({
        stage: 'Current Stage (Class 9-10)',
        title: 'Pre-Matric Foundation & Board Clearance',
        schemeAlignment: 'MoTA Pre-Matric Scholarship (Scheme ARG41)',
        keyBenefits: [
          'Direct Benefit Transfer of ₹3,500 - ₹7,000/yr maintenance allowance',
          'Free textbook grants & remedial coaching in Ashram schools',
          'Coverage of board examination fees'
        ],
        actionRequired: 'Ensure income certificate (< ₹2.5L) is certified by Tehsildar and linked to Aadhaar-DBT bank account.',
        estimatedFinancialSupport: '₹3,500 - ₹7,000 / year'
      });
      academicPath.push({
        stage: 'Next Milestone (Class 11-12)',
        title: 'Higher Secondary & Competitive Coaching Track',
        schemeAlignment: 'MoTA Post-Matric Scholarship (Scheme ARG42)',
        keyBenefits: [
          'Tuition fee reimbursement + hostel allowance up to ₹13,500/yr',
          'Special coaching allowances for JEE / NEET / CUET entrance examinations',
          'Access to Eklavya Model Residential School (EMRS) labs and digital libraries'
        ],
        actionRequired: 'Opt for Science/Commerce/Arts stream aligned with career goals; register on National Scholarship Portal (NSP).',
        estimatedFinancialSupport: '₹7,000 - ₹13,500 / year'
      });
      academicPath.push({
        stage: 'Graduation Gate (UG / Premier Institutes)',
        title: 'Top Class Premier Higher Education',
        schemeAlignment: 'Top Class Education Scheme (ARG43)',
        keyBenefits: [
          'Full tuition fee waiver in IITs, NITs, IIMs, AIIMS, NLUs (260+ empanelled institutes)',
          'One-time computer/laptop grant up to ₹45,000',
          'Monthly living allowance of ₹3,000 + ₹3,000 annual book grant'
        ],
        actionRequired: 'Secure admission through national entrance tests (JEE/NEET/CLAT) in Top Class empanelled institutes.',
        estimatedFinancialSupport: 'Up to ₹2,50,000/yr + ₹45,000 hardware'
      });
    } else if (profile.courseLevel === 'Class XI-XII') {
      academicPath.push({
        stage: 'Current Stage (Class 11-12)',
        title: 'Post-Matric Intermediate Studies',
        schemeAlignment: 'MoTA Post-Matric Scheme (ARG42)',
        keyBenefits: [
          'Full tuition fee coverage + monthly maintenance stipend',
          'Free test application vouchers for CUET and Central University entrances'
        ],
        actionRequired: 'Focus on qualifying marks (>60%) to unlock Top Class Education quota.',
        estimatedFinancialSupport: '₹7,000 - ₹13,500 / year'
      });
      academicPath.push({
        stage: 'Undergraduate Gateway',
        title: 'Premier Bachelor Degree (B.Tech / MBBS / B.A. LLB)',
        schemeAlignment: 'Top Class Education Scheme (ARG43)',
        keyBenefits: [
          '100% non-refundable fees covered directly by Ministry of Tribal Affairs',
          'Hardware assistance grant (₹45,000 for laptop/desktop)',
          'Living & lodging reimbursement of ₹36,000/year'
        ],
        actionRequired: 'Appear for JEE Advanced, NEET-UG, CUET, or CLAT with 7.5% ST statutory cut-off concession.',
        estimatedFinancialSupport: '₹2,00,000 - ₹3,50,000 / year'
      });
    } else if (profile.courseLevel === 'UG') {
      academicPath.push({
        stage: 'Current Stage (Undergraduate Degree)',
        title: 'Professional Graduation & Career Launch',
        schemeAlignment: 'Top Class (ARG43) / Post-Matric Higher Ed',
        keyBenefits: [
          'Tuition grant + book/stationery allowance',
          'Zero exam fee for GATE, CUET-PG, and UPSC CSE'
        ],
        actionRequired: 'Maintain academic score above 55% for unconditional Masters / Fellowship eligibility.',
        estimatedFinancialSupport: '₹50,000 - ₹2,50,000 / year'
      });
      academicPath.push({
        stage: 'Postgraduate & Research Track',
        title: 'National Fellowship for Higher Education (NFST)',
        schemeAlignment: 'National Fellowship for ST Students (NFST - Scheme ARG45)',
        keyBenefits: [
          'JRF stipend: ₹37,000/month for first 2 years',
          'SRF stipend: ₹42,000/month for next 3 years',
          'Annual contingency grant of ₹20,000 - ₹25,000 + statutory HRA'
        ],
        actionRequired: 'Register for M.Phil / Ph.D in Indian Universities; qualify through UGC-NET or Institutional Research Entrance.',
        estimatedFinancialSupport: '₹4,80,000 - ₹5,40,000 / year'
      });
      academicPath.push({
        stage: 'Global Overseas Studies Track',
        title: 'National Overseas Scholarship (NOS)',
        schemeAlignment: 'National Overseas Scholarship for ST Students (AZKMI)',
        keyBenefits: [
          'Full tuition fees paid directly to international university (Oxford, Cambridge, Harvard, etc.)',
          'Annual maintenance allowance: £9,900 (UK) / $15,400 (US/Others)',
          'Airfare, visa costs, and health insurance completely sponsored by Government of India'
        ],
        actionRequired: 'Secure unconditional offer letter in Top 500 QS World Ranked universities; apply through MoTA portal.',
        estimatedFinancialSupport: '₹25,00,000 - ₹45,00,000 / year'
      });
    } else {
      // PG, M.Phil/Ph.D, or Overseas
      academicPath.push({
        stage: 'Current Advanced Stage (PG / Research)',
        title: 'Doctoral Research & Academic Excellence',
        schemeAlignment: 'NFST Fellowship (ARG45) / NOS Overseas (AZKMI)',
        keyBenefits: [
          'Direct monthly DBT: ₹37,000 (JRF) / ₹42,000 (SRF) + HRA',
          'Annual research contingency: ₹20,500 (Humanities) / ₹25,000 (Sciences)',
          'Full travel grant support for presenting papers at international conferences'
        ],
        actionRequired: 'Complete coursework, submit biannual progress reports via guide portal, and publish in UGC-CARE journals.',
        estimatedFinancialSupport: '₹4,80,000 - ₹5,40,000 / year'
      });
      academicPath.push({
        stage: 'Post-Doctoral & Faculty Appointment',
        title: 'Central University Faculty & Research Scientist Induction',
        schemeAlignment: 'UGC 200-Point Roster Faculty Reservation',
        keyBenefits: [
          '7.5% reserved vacancies for Assistant Professor & Associate Professor in Central Universities',
          'Fast-track selection committee reviews for ST researchers with high impact publications',
          'Eligibility for CSIR-Nehru and SERB Ramanujan Re-entry Fellowships'
        ],
        actionRequired: 'Archive thesis in Shodhganga INFLIBNET repository; obtain Ph.D. degree notification.',
        estimatedFinancialSupport: 'Level 10 Pay Matrix (₹57,700 - ₹1,82,400)'
      });
    }

    // 2. Statutory Entitlements (DoPT, Constitution of India)
    const statutoryEntitlements: ReservationEntitlement[] = [
      {
        title: '7.5% Central Government Employment Quota',
        ruleCitation: 'Article 16(4) of the Constitution & DoPT OM No. 36012/16/2019',
        quotaDetails: '7.5% direct reservation in all Group A, B, C & D Central Civil Services & PSUs',
        benefitDescription: 'Guaranteed quota in UPSC (IAS/IPS/IFS), SSC CGL, Banking (IBPS), Railways (RRB), and Defense civilian cadres.'
      },
      {
        title: '5 Years Age Relaxation in Public Competitions',
        ruleCitation: 'DoPT Statutory Age Concession Rules for Scheduled Tribes',
        quotaDetails: 'Upper age limit extended by +5 years over General category ceiling',
        benefitDescription: 'Eligible to appear for UPSC Civil Services up to age 37 (General ceiling: 32). State PSCs often extend up to 40-42 years.'
      },
      {
        title: 'Unlimited Attempts in UPSC Civil Services',
        ruleCitation: 'UPSC CSE Examination Rules, Clause 4 (Attempts for ST)',
        quotaDetails: 'No ceiling on number of attempts until reaching the age of 37',
        benefitDescription: 'Unlike General candidates (capped at 6 attempts) and OBCs (capped at 9 attempts), ST candidates can attempt every cycle.'
      },
      {
        title: '100% Application Fee Exemption',
        ruleCitation: 'Department of Expenditure Financial Concession Orders',
        quotaDetails: 'Zero fee for UPSC, SSC, GATE, CUET, UGC-NET, and IBPS examinations',
        benefitDescription: 'Free examination enrollment across all Union Government and autonomous recruitment testing bodies.'
      },
      {
        title: 'Exemption from "Creamy Layer" Exclusion',
        ruleCitation: 'Supreme Court of India (Indra Sawhney / Jarnail Singh Rulings)',
        quotaDetails: 'Creamy layer concept is NOT applicable to Scheduled Tribes in Central services',
        benefitDescription: 'Reservation entitlements in jobs and higher education admissions remain unconditionally protected regardless of parental income ceiling.'
      }
    ];

    if (isPVTG) {
      statutoryEntitlements.unshift({
        title: 'PM-JANMAN Mission & Dedicated PVTG Priority Hiring',
        ruleCitation: 'Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN)',
        quotaDetails: 'Sub-quota priority in tribal development cadres, EMRS teacher recruitment, and ITDA projects',
        benefitDescription: 'Direct fast-track recruitment drives by state welfare departments for educated PVTG youth.'
      });
    }

    if (isPwD) {
      statutoryEntitlements.push({
        title: '4% Horizontal Reservation for Divyangjan (PwD)',
        ruleCitation: 'Rights of Persons with Disabilities (RPwD) Act 2016, Section 34',
        quotaDetails: '4% quota reserved horizontally within the ST category in all government posts',
        benefitDescription: 'Includes additional 10-year age relaxation (up to age 47) and special assistive technology allowances.'
      });
    }

    // 3. Career Gateways
    const careerGateways: CareerGateway[] = [
      {
        sector: 'Union & State Civil Services',
        exams: ['UPSC CSE (IAS / IPS / IFS)', 'State PSC Combined Administrative Services'],
        stPrivilege: '7.5% quota, relaxed qualifying prelims/mains cutoffs (often 20-30 marks lower), unlimited attempts up to age 37.',
        preparationTip: 'Avail free UPSC coaching under MoTA / Ministry of Social Justice Pre-Examination Training Centers (PETC).'
      },
      {
        sector: 'Public Sector Engineering & Navratna PSUs',
        exams: ['GATE (Graduate Aptitude Test in Engineering)', 'Direct PSU Recruitment (ONGC, IOCL, BHEL, Coal India)'],
        stPrivilege: 'Special ST recruitment backlog drives with relaxed score benchmarks; 100% reimbursement of exam fees.',
        preparationTip: 'Target core engineering branches where ST PSU vacancies consistently have high recruitment yields.'
      },
      {
        sector: 'Higher Education Faculty & Scientific Research',
        exams: ['UGC-NET / CSIR-NET JRF', 'State SET / SLET examinations'],
        stPrivilege: 'Statutory 5% marks relaxation in Master’s degree (50% vs 55%) + 200-point roster reservation for Assistant Professor vacancies.',
        preparationTip: 'Securing JRF simultaneously qualifies you for the ₹37,000/month NFST fellowship.'
      },
      {
        sector: 'Banking & Public Financial Institutions',
        exams: ['IBPS PO & Clerk', 'SBI Probationary Officer & Specialist Cadre'],
        stPrivilege: 'Pre-exam orientation training conducted by nationalized banks exclusively for ST/SC applicants + score relaxations.',
        preparationTip: 'Focus on quantitative aptitude and banking awareness through dedicated tribal development coaching cells.'
      }
    ];

    // 4. Documentation Checklist
    const documentationChecklist: string[] = [
      'Digital ST Certificate issued by competent revenue authority (Sub-Divisional Officer / Tehsildar) with DigiLocker QR verification seal.',
      'Current Financial Year Income Certificate (mandatory for Pre-Matric, Post-Matric, Top Class, and NOS).',
      'Bank Account seeded with Aadhaar and mapped with NPCI Direct Benefit Transfer (DBT) gateway.',
      'Class 10th Board Certificate / Birth Certificate for proof of age and date of birth.',
      'Institute Bonafide & Enrollment Certificate containing official AISHE Directory Code.'
    ];

    if (isPwD) {
      documentationChecklist.push('Unique Disability ID (UDID) card confirming disability benchmark of 40% or higher.');
    }

    if (isPVTG) {
      documentationChecklist.push('Specific PVTG Tribe Certificate issued by District Collector / Tribal Welfare Officer.');
    }

    return {
      candidateSummary: {
        categoryLabel: isPVTG ? 'Particularly Vulnerable Tribal Group (PVTG)' :
                       isPwD ? 'ST Divyangjan (PwD ≥ 40%)' :
                       profile.category === 'FEMALE_ST' ? 'Female Scheduled Tribe' :
                       isST ? 'Scheduled Tribe (General ST)' : 'General Category',
        levelLabel: profile.courseLevel,
        careerStage: profile.courseLevel.includes('Class') ? 'School & Secondary Foundation' :
                     profile.courseLevel === 'UG' ? 'Undergraduate Higher Education' : 'Research & Professional Career'
      },
      academicPath,
      statutoryEntitlements,
      careerGateways,
      documentationChecklist
    };
  }
}
