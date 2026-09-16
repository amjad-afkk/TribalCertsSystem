export type QuotaType = 'UNCAPPED' | 'FIXED_SLOTS';
export type SelectionMethod = 'AUTO_GATE' | 'MERIT_WATERFALL' | 'TIERED_PRIORITY';
export type DisbursementFrequency = 'ANNUAL' | 'QUARTERLY' | 'SEMESTER_FOREX';

export type ApplicantCategory = 'PVTG' | 'DIVYANGJAN' | 'FEMALE_ST' | 'ST_OTHER';
export type Gender = 'FEMALE' | 'MALE' | 'OTHER';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_SCRUTINY'
  | 'DEFICIENCY_FLAGGED'
  | 'RESUBMITTED'
  | 'VERIFIED'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'REJECTED'
  | 'DISBURSED';

export type VerificationTier = 'INO' | 'STATE_NODAL' | 'MOTA_ADMIN' | 'SELECTION_COMMITTEE';

export interface DocumentChecklistItem {
  docType: string;
  title: string;
  required: boolean;
  maxAgeDays?: number;
}

export interface WaterfallTierConfig {
  tier: string;
  label: string;
  priority: number;
  allocatedSlots?: number;
  spilloverTargetTier?: string;
}

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
  quotaType: QuotaType;
  totalSlots: number | null;
  selectionMethod: SelectionMethod;
  reservationWaterfall: WaterfallTierConfig[];
  documentChecklist: DocumentChecklistItem[];
  verificationHierarchy: VerificationTier[];
  disbursementFrequency: DisbursementFrequency;
  isActive: boolean;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaarMasked: string;
  aadhaarHash: string;
  category: ApplicantCategory;
  isPwD: boolean;
  isPVTG: boolean;
  gender: Gender;
  annualIncome: number;
  state: string;
  district: string;
  instituteName: string;
  courseLevel: string;
  academicPercentage: number;
  bankAccountHash: string;
  createdAt: string;
}

export interface Application {
  id: string;
  applicantId: string;
  schemeId: string;
  academicYear: string;
  status: ApplicationStatus;
  currentStage: string;
  submittedAt: string | null;
  formData: Record<string, any>;
  explainableStatus: string;
  deficiencyReason: string | null;
  aiDiscrepancyScore: number;
}

export interface DocumentRecord {
  id: string;
  applicationId: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  ocrExtracted: Record<string, any> | null;
  status: 'PENDING_OCR' | 'OCR_VERIFIED' | 'DEFICIENCY_FLAGGED' | 'RESUBMISSION_PENDING' | 'ACCEPTED';
  discrepancyNote: string | null;
}

export interface VerificationStageRecord {
  id: string;
  applicationId: string;
  tier: VerificationTier;
  reviewerId: string;
  reviewerName: string;
  action: 'APPROVED' | 'FLAGGED_DEFICIENCY' | 'REJECTED' | 'FORWARDED';
  comments: string;
  timestamp: string;
}

export interface SelectionRecord {
  id: string;
  schemeId: string;
  applicationId: string;
  applicantId: string;
  quotaTier: string;
  originalTier: string;
  isSpillover: boolean;
  meritRank: number | null;
  priorityTier: number | null;
  qsRank: number | null;
  universityName: string | null;
  committeeSignedOff: boolean;
  signedOffAt: string | null;
  disbursementAmountInr: number;
  status: 'PROVISIONAL' | 'CONFIRMED' | 'REJECTED';
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  actor: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface QSUniversity {
  rank: number;
  name: string;
  country: string;
  city: string;
}

export interface SchemeMatchResult {
  schemeId: string;
  schemeName: string;
  schemeCode: string;
  matchScore: number; // 0 to 100
  isEligible: boolean;
  reasons: string[];
  blockers: string[];
}
