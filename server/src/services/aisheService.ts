export interface AisheInstitute {
  aisheCode: string;
  name: string;
  state: string;
  district: string;
  type: 'CENTRAL_UNIVERSITY' | 'IIT' | 'NIT' | 'AIIMS' | 'IIM' | 'STATE_GOV' | 'AFFILIATED_COLLEGE';
  naacGrade: string;
  nirfRank: number | null;
  isTopClassEmpanelled: boolean;
  status: 'ACTIVE_ACCREDITED' | 'PROBATION' | 'UNACCREDITED';
  escrowAccountMapped: boolean;
  pfmsTreasuryCode: string;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
}

export interface DualEscrowDisbursementPlan {
  applicationId?: string;
  schemeCode: string;
  totalSanctionedGrant: number;
  institutionalEscrowAmount: number;
  studentDbtDirectAmount: number;
  instituteRecipient: {
    aisheCode: string;
    instituteName: string;
    pfmsTreasuryCode: string;
    description: string;
  };
  studentRecipient: {
    aadhaarMasked: string;
    dbtBankSeeded: boolean;
    description: string;
  };
  fraudRiskScore: number; // 0 to 100 (0 = clean, >50 = high risk)
  fraudRiskReasons: string[];
}

export class AisheService {
  private static institutes: AisheInstitute[] = [
    {
      aisheCode: 'U-0108',
      name: 'Jawaharlal Nehru University (JNU), New Delhi',
      state: 'Delhi',
      district: 'New Delhi',
      type: 'CENTRAL_UNIVERSITY',
      naacGrade: 'A++',
      nirfRank: 2,
      isTopClassEmpanelled: true,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-JNU-001',
      nodalOfficerName: 'Dr. Ramesh Chandra',
      nodalOfficerEmail: 'ino@jnu.ac.in'
    },
    {
      aisheCode: 'U-0053',
      name: 'Indian Institute of Technology (IIT) Delhi',
      state: 'Delhi',
      district: 'South Delhi',
      type: 'IIT',
      naacGrade: 'A++',
      nirfRank: 2,
      isTopClassEmpanelled: true,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-IITD-014',
      nodalOfficerName: 'Prof. Animesh Das',
      nodalOfficerEmail: 'ino.mota@iitd.ac.in'
    },
    {
      aisheCode: 'U-0139',
      name: 'National Institute of Technology (NIT) Raipur',
      state: 'Chhattisgarh',
      district: 'Raipur',
      type: 'NIT',
      naacGrade: 'A+',
      nirfRank: 65,
      isTopClassEmpanelled: true,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-NITRR-092',
      nodalOfficerName: 'Dr. P. K. Bajpai',
      nodalOfficerEmail: 'ino@nitrr.ac.in'
    },
    {
      aisheCode: 'U-0014',
      name: 'All India Institute of Medical Sciences (AIIMS) New Delhi',
      state: 'Delhi',
      district: 'New Delhi',
      type: 'AIIMS',
      naacGrade: 'A++',
      nirfRank: 1,
      isTopClassEmpanelled: true,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-AIIMS-001',
      nodalOfficerName: 'Dr. Sanjay Arya',
      nodalOfficerEmail: 'dean.acad@aiims.edu'
    },
    {
      aisheCode: 'U-0355',
      name: 'Utkal University, Bhubaneswar',
      state: 'Odisha',
      district: 'Khurda',
      type: 'STATE_GOV',
      naacGrade: 'A+',
      nirfRank: 88,
      isTopClassEmpanelled: false,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-UTKAL-041',
      nodalOfficerName: 'Dr. Manas Rath',
      nodalOfficerEmail: 'ino@utkaluniversity.ac.in'
    },
    {
      aisheCode: 'U-0241',
      name: 'Indira Gandhi National Tribal University (IGNTU), Amarkantak',
      state: 'Madhya Pradesh',
      district: 'Anuppur',
      type: 'CENTRAL_UNIVERSITY',
      naacGrade: 'A',
      nirfRank: 112,
      isTopClassEmpanelled: true,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-IGNTU-007',
      nodalOfficerName: 'Dr. Sanjeev Sharma',
      nodalOfficerEmail: 'tribal.scholarships@igntu.ac.in'
    },
    {
      aisheCode: 'C-2451',
      name: 'Government Model Science College, Jabalpur',
      state: 'Madhya Pradesh',
      district: 'Jabalpur',
      type: 'AFFILIATED_COLLEGE',
      naacGrade: 'A',
      nirfRank: null,
      isTopClassEmpanelled: false,
      status: 'ACTIVE_ACCREDITED',
      escrowAccountMapped: true,
      pfmsTreasuryCode: 'PFMS-TREAS-GMSC-102',
      nodalOfficerName: 'Prof. Anita Dubey',
      nodalOfficerEmail: 'nodal.science@mp.gov.in'
    },
    {
      aisheCode: 'C-9999',
      name: 'Unverified Polytechnic Academy (Blacklisted)',
      state: 'Jharkhand',
      district: 'Ranchi',
      type: 'AFFILIATED_COLLEGE',
      naacGrade: 'NA',
      nirfRank: null,
      isTopClassEmpanelled: false,
      status: 'UNACCREDITED',
      escrowAccountMapped: false,
      pfmsTreasuryCode: '',
      nodalOfficerName: 'Unknown',
      nodalOfficerEmail: 'fake@example.com'
    }
  ];

  static validateAisheCode(code: string): { isValid: boolean; institute: AisheInstitute | null; warnings: string[] } {
    const warnings: string[] = [];
    const inst = this.institutes.find(i => i.aisheCode.toUpperCase() === code.trim().toUpperCase());

    if (!inst) {
      warnings.push(`AISHE code "${code}" is not registered in the National Higher Education Directory. High risk of fraudulent claim.`);
      return { isValid: false, institute: null, warnings };
    }

    if (inst.status === 'UNACCREDITED') {
      warnings.push(`Institute "${inst.name}" is marked UNACCREDITED or blacklisted. Scholarship disbursements cannot be routed.`);
    }

    if (!inst.escrowAccountMapped) {
      warnings.push('Institute PFMS Treasury Escrow account has not been mapped or verified with the Ministry of Finance.');
    }

    return {
      isValid: inst.status !== 'UNACCREDITED',
      institute: inst,
      warnings
    };
  }

  static searchInstitutes(query: string): AisheInstitute[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.institutes.filter(i => i.status !== 'UNACCREDITED');
    return this.institutes.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.aisheCode.toLowerCase().includes(q) ||
      i.state.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q)
    );
  }

  static calculateDualEscrowRouting(
    schemeCode: string,
    totalAwardAmount: number,
    aisheCode: string,
    aadhaarMasked: string = 'XXXX-XXXX-4123'
  ): DualEscrowDisbursementPlan {
    const { institute, warnings } = this.validateAisheCode(aisheCode);
    const inst = institute || {
      aisheCode,
      name: 'Unverified Educational Entity',
      state: 'Unknown',
      district: 'Unknown',
      type: 'AFFILIATED_COLLEGE' as const,
      naacGrade: 'NA',
      nirfRank: null,
      isTopClassEmpanelled: false,
      status: 'UNACCREDITED' as const,
      escrowAccountMapped: false,
      pfmsTreasuryCode: 'UNMAPPED',
      nodalOfficerName: 'N/A',
      nodalOfficerEmail: 'N/A'
    };

    let institutionalEscrowAmount = 0;
    let studentDbtDirectAmount = totalAwardAmount;
    let fraudRiskScore = warnings.length > 0 ? 75 : 5;
    const fraudRiskReasons = [...warnings];

    if (schemeCode === 'ARG43') {
      // Top Class Education Scheme: Non-refundable tuition fees to Institute, maintenance/hardware to Student
      institutionalEscrowAmount = Math.round(totalAwardAmount * 0.70); // 70% tuition
      studentDbtDirectAmount = totalAwardAmount - institutionalEscrowAmount; // 30% stipend + laptop
      if (!inst.isTopClassEmpanelled) {
        fraudRiskScore += 35;
        fraudRiskReasons.push('Institute is NOT officially empanelled under MoTA Top Class Education Scheme guidelines.');
      }
    } else if (schemeCode === 'ARG42') {
      // Post-Matric: 50% tuition to institute, 50% maintenance to student
      institutionalEscrowAmount = Math.round(totalAwardAmount * 0.50);
      studentDbtDirectAmount = totalAwardAmount - institutionalEscrowAmount;
    } else if (schemeCode === 'ARG45') {
      // NFST Fellowship: 100% stipend (₹37,000/mo) directly to student DBT; contingency to student
      institutionalEscrowAmount = 0;
      studentDbtDirectAmount = totalAwardAmount;
    }

    return {
      schemeCode,
      totalSanctionedGrant: totalAwardAmount,
      institutionalEscrowAmount,
      studentDbtDirectAmount,
      instituteRecipient: {
        aisheCode: inst.aisheCode,
        instituteName: inst.name,
        pfmsTreasuryCode: inst.pfmsTreasuryCode,
        description: `Direct Institutional Escrow: Verified PFMS Account of ${inst.name}`
      },
      studentRecipient: {
        aadhaarMasked,
        dbtBankSeeded: true,
        description: `Direct Benefit Transfer (DBT): Aadhaar-linked NPCI Account of Beneficiary (${aadhaarMasked})`
      },
      fraudRiskScore: Math.min(100, fraudRiskScore),
      fraudRiskReasons
    };
  }
}
