const DEFAULT_BASE = import.meta.env.VITE_API_BASE || '/api';
const DIRECT_BASE = 'http://localhost:4000/api';
let API_BASE = DEFAULT_BASE;

let activeUserRole: string = 'applicant-pooja';

export const setApiRole = (role: string): void => {
  activeUserRole = role;
};

export const getApiRole = (): string => activeUserRole;

const getHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-User-Role': activeUserRole,
    ...extra
  };
};

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const safeFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    let res = await fetch(url, options);

    // If proxied /api fails with 404 and running locally, try direct localhost:4000
    if (!res.ok && res.status === 404 && API_BASE === DEFAULT_BASE && isLocal) {
      try {
        const directUrl = `${DIRECT_BASE}${endpoint}`;
        const fallbackRes = await fetch(directUrl, options);
        if (fallbackRes.ok || fallbackRes.status < 500) {
          res = fallbackRes;
          // Remember the working base, but DON'T permanently overwrite API_BASE
          // so future requests still try the proxy first
        }
      } catch {
        // keep original response
      }
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (res.ok) return { success: true, data: text };
      return { success: false, message: text || `HTTP ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    // If relative fetch failed entirely and running locally, attempt direct localhost:4000
    if (API_BASE === DEFAULT_BASE && isLocal) {
      try {
        const directUrl = `${DIRECT_BASE}${endpoint}`;
        const fallbackRes = await fetch(directUrl, options);
        const contentType = fallbackRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await fallbackRes.json();
        }
        return { success: fallbackRes.ok, message: await fallbackRes.text() };
      } catch (fallbackErr: any) {
        console.error(`[API Network Error] ${options.method || 'GET'} ${url}:`, fallbackErr);
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Unable to connect to backend service. Please verify server is running on port 4000.'
        };
      }
    }

    console.error(`[API Network Error] ${options.method || 'GET'} ${url}:`, err);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: err?.message || 'Unable to connect to backend service.'
    };
  }
};

export const api = {
  // Schemes
  getSchemes: async () => {
    return safeFetch('/schemes', { headers: getHeaders() });
  },
  getSchemeById: async (id: string) => {
    return safeFetch(`/schemes/${id}`, { headers: getHeaders() });
  },
  createScheme: async (schemeData: any) => {
    return safeFetch('/schemes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(schemeData)
    });
  },

  // Simulator
  runSimulator: async (criteria: any) => {
    return safeFetch('/simulator/match', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(criteria)
    });
  },
  getCareerRoadmap: async (criteria: any) => {
    return safeFetch('/simulator/roadmap', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(criteria)
    });
  },

  // AISHE Directory & Institutional Anti-Scam Shield
  searchInstitutes: async (query: string = '') => {
    return safeFetch(`/institutes/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
  },
  validateAisheCode: async (aisheCode: string) => {
    return safeFetch('/institutes/validate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ aisheCode })
    });
  },
  calculateEscrowPlan: async (payload: { schemeCode: string; totalAwardAmount: number; aisheCode: string; aadhaarMasked?: string }) => {
    return safeFetch('/institutes/escrow-routing', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Voice-First Jan-Jatiya Sahayak & Explainable Deficiency
  getSahayakGuidance: async (payload: { deficiencyText: string; applicantName: string; language: string }) => {
    return safeFetch('/deficiency/sahayak', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Applications
  getApplications: async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return safeFetch(`/applications${qs}`, { headers: getHeaders() });
  },
  getApplicationById: async (id: string) => {
    return safeFetch(`/applications/${id}`, { headers: getHeaders() });
  },
  submitApplication: async (payload: any) => {
    return safeFetch('/applications', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  resubmitDeficiency: async (id: string, payload: { explanation: string; newDocuments?: any[] }) => {
    return safeFetch(`/applications/${id}/resubmit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  batchSyncApplications: async (payload: { ashramSchoolCode?: string; batchId?: string; applications: any[] }) => {
    return safeFetch('/applications/batch-sync', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Verification review
  reviewApplication: async (id: string, payload: any) => {
    return safeFetch(`/applications/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Document status review
  updateDocumentStatus: async (docId: string, status: string, notes?: string) => {
    return safeFetch(`/documents/${docId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
  },

  // Document OCR extraction & check
  extractAndVerifyDocument: async (payload: any) => {
    return safeFetch('/documents/extract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Selection Waterfalls
  runWaterfallSimulation: async (payload?: any) => {
    return safeFetch('/selection/waterfall', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ academicYear: '2025-26', ...payload })
    });
  },
  runNosSelection: async () => {
    return safeFetch('/selection/nos', { headers: getHeaders() });
  },
  signOffSelection: async (payload: any) => {
    return safeFetch('/selection/sign-off', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Analytics
  getAnalytics: async () => {
    return safeFetch('/analytics', { headers: getHeaders() });
  },
  dispatchMobileVan: async (payload: { district: string; blocks?: string }) => {
    return safeFetch('/analytics/dispatch-van', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Applicants
  getApplicants: async () => {
    return safeFetch('/applicants', { headers: getHeaders() });
  },

  // AI Regional Chatbot
  chatWithBot: async (payload: { message: string; language: string }) => {
    return safeFetch('/chatbot', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Authentication & Identity (Citizen Aadhaar OTP + Officer SSO)
  sendOtp: async (payload: { identifier?: string; personaId?: string }) => {
    return safeFetch('/auth/send-otp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  verifyOtp: async (payload: { sessionId: string; otp: string }) => {
    return safeFetch('/auth/verify-otp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  officerLogin: async (payload: { designation: string; officerId?: string; pin?: string }) => {
    return safeFetch('/auth/officer-login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Post-Selection Fellowship Lifecycle Management (FR-7.1 to FR-7.5)
  getFellowshipRecord: async (applicantId: string) => {
    return safeFetch(`/fellowship/${applicantId}`, { headers: getHeaders() });
  },
  submitJoiningReport: async (payload: { fellowshipId: string; supervisorName: string; joiningReportUrl?: string }) => {
    return safeFetch('/fellowship/joining', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  submitContinuationReport: async (payload: {
    fellowshipId: string;
    quarterNumber: number;
    academicYear: string;
    attendancePercentage: number;
    progressSummary: string;
  }) => {
    return safeFetch('/fellowship/continuation', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  submitThesis: async (payload: { fellowshipId: string; thesisTitle: string; synopsisSummary?: string }) => {
    return safeFetch('/fellowship/thesis', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  guideSignOff: async (payload: { fellowshipId: string; guideToken?: string; guideComments?: string; rating?: string }) => {
    return safeFetch('/fellowship/guide-signoff', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  upgradeJrfToSrf: async (payload: { fellowshipId: string; assessmentCommitteeNotes?: string; publishedPapersCount?: number }) => {
    return safeFetch('/fellowship/upgrade-srf', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },
  verifyShodhgangaArchival: async (payload: { thesisTitle?: string; candidateName?: string; university?: string }) => {
    return safeFetch('/fellowship/shodhganga-verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // DigiLocker Integration & QR Verification (FR-1.2, Section 5.4)
  getDigiLockerDocuments: async (applicantId?: string) => {
    const qs = applicantId ? `?applicantId=${encodeURIComponent(applicantId)}` : '';
    return safeFetch(`/digilocker/documents${qs}`, { headers: getHeaders() });
  },
  verifyCertificateRegistry: async (payload: {
    certificateNumber: string;
    docType?: string;
    issuer?: string;
    applicantName?: string;
    applicantId?: string;
  }) => {
    return safeFetch('/digilocker/verify-certificate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // Multi-Channel Notifications (FR-4.6, §6.8)
  getNotifications: async (recipientId?: string) => {
    const qs = recipientId ? `?recipientId=${encodeURIComponent(recipientId)}` : '';
    return safeFetch(`/notifications${qs}`, { headers: getHeaders() });
  },
  markNotificationRead: async (id: string) => {
    return safeFetch(`/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
  },
  sendTestNudge: async (payload: { recipientId: string; channel?: string; title: string; message: string }) => {
    return safeFetch('/notifications/test-nudge', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
  }
};
