export interface Scheme {
  id: string;
  code: string;
  name: string;
  level: string;
  description: string;
  legacyPortal: string;
  incomeCeiling: number | null;
  ageCeiling: number | null;
  academicThreshold: number | null;
  quotaType: 'UNCAPPED' | 'FIXED_SLOTS';
  totalSlots: number | null;
  selectionMethod: 'AUTO_GATE' | 'MERIT_WATERFALL' | 'TIERED_PRIORITY';
  reservationWaterfall: Array<{
    tier: string;
    label: string;
    priority: number;
    allocatedSlots?: number;
    spilloverTargetTier?: string;
    allocatedBudget?: number;
    unitCostPerAwardee?: number;
  }>;
  documentChecklist: Array<{
    docType: string;
    title: string;
    required: boolean;
  }>;
  verificationHierarchy: string[];
  disbursementFrequency: 'ANNUAL' | 'QUARTERLY' | 'SEMESTER_FOREX';
  isActive: boolean;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaarMasked: string;
  category: 'PVTG' | 'DIVYANGJAN' | 'FEMALE_ST' | 'ST_OTHER';
  isPwD: boolean;
  isPVTG: boolean;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  annualIncome: number;
  state: string;
  district: string;
  instituteName: string;
  courseLevel: string;
  academicPercentage: number;
}

export interface ApplicationItem {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantCategory: string;
  applicantState: string;
  instituteName: string;
  aadhaarMasked: string;
  schemeId: string;
  schemeName: string;
  schemeCode: string;
  schemeLevel: string;
  incomeCeiling?: number;
  academicYear: string;
  status: string;
  currentStage: string;
  submittedAt: string | null;
  formData: Record<string, any>;
  documents?: any[];
  explainableStatus: string;
  deficiencyReason: string | null;
  aiDiscrepancyScore: number;
  createdAt: string;
}

export interface SchemeMatchResult {
  schemeId: string;
  schemeName: string;
  schemeCode: string;
  matchScore: number;
  isEligible: boolean;
  reasons: string[];
  blockers: string[];
}

export type UserRole =
  | 'APPLICANT'
  | 'INO'
  | 'STATE_NODAL'
  | 'COMMITTEE'
  | 'MOTA_ADMIN';

export interface PersonaConfig {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  clearanceLevel: string;
  badgeColor: string;
}

