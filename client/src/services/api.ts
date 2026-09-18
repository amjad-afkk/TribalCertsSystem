const API_BASE = 'http://localhost:4000/api';

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

export const api = {
  // Schemes
  getSchemes: async () => {
    const res = await fetch(`${API_BASE}/schemes`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getSchemeById: async (id: string) => {
    const res = await fetch(`${API_BASE}/schemes/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  createScheme: async (schemeData: any) => {
    const res = await fetch(`${API_BASE}/schemes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(schemeData)
    });
    return res.json();
  },

  // Simulator
  runSimulator: async (criteria: any) => {
    const res = await fetch(`${API_BASE}/simulator/match`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(criteria)
    });
    return res.json();
  },

  // Applications
  getApplications: async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/applications${qs}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getApplicationById: async (id: string) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  submitApplication: async (payload: any) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  resubmitDeficiency: async (id: string, payload: { explanation: string }) => {
    const res = await fetch(`${API_BASE}/applications/${id}/resubmit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Verification review
  reviewApplication: async (id: string, payload: any) => {
    const res = await fetch(`${API_BASE}/applications/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Document OCR extraction & check
  extractAndVerifyDocument: async (payload: any) => {
    const res = await fetch(`${API_BASE}/documents/extract`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Selection Waterfalls
  runWaterfallSimulation: async (payload?: any) => {
    const res = await fetch(`${API_BASE}/selection/waterfall`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload || {})
    });
    return res.json();
  },
  runNosSelection: async () => {
    const res = await fetch(`${API_BASE}/selection/nos`, {
      headers: getHeaders()
    });
    return res.json();
  },
  signOffSelection: async (payload: any) => {
    const res = await fetch(`${API_BASE}/selection/sign-off`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Applicants
  getApplicants: async () => {
    const res = await fetch(`${API_BASE}/applicants`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // AI Regional Chatbot
  chatWithBot: async (payload: { message: string; language: string }) => {
    const res = await fetch(`${API_BASE}/chatbot`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Authentication & Identity (Citizen Aadhaar OTP + Officer SSO)
  sendOtp: async (payload: { identifier?: string; personaId?: string }) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  verifyOtp: async (payload: { sessionId: string; otp: string }) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  officerLogin: async (payload: { designation: string; officerId?: string; pin?: string }) => {
    const res = await fetch(`${API_BASE}/auth/officer-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Post-Selection Fellowship Lifecycle Management (FR-7.1 to FR-7.5)
  getFellowshipRecord: async (applicantId: string) => {
    const res = await fetch(`${API_BASE}/fellowship/${applicantId}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  submitJoiningReport: async (payload: { fellowshipId: string; supervisorName: string; joiningReportUrl?: string }) => {
    const res = await fetch(`${API_BASE}/fellowship/joining`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  submitContinuationReport: async (payload: {
    fellowshipId: string;
    quarterNumber: number;
    academicYear: string;
    attendancePercentage: number;
    progressSummary: string;
  }) => {
    const res = await fetch(`${API_BASE}/fellowship/continuation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  submitThesis: async (payload: { fellowshipId: string; thesisTitle: string; synopsisSummary?: string }) => {
    const res = await fetch(`${API_BASE}/fellowship/thesis`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // DigiLocker Integration & QR Verification (FR-1.2, Section 5.4)
  getDigiLockerDocuments: async (applicantId?: string) => {
    const qs = applicantId ? `?applicantId=${encodeURIComponent(applicantId)}` : '';
    const res = await fetch(`${API_BASE}/digilocker/documents${qs}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  verifyCertificateQr: async (payload: { docUri: string; certificateNumber?: string; issuer?: string }) => {
    const res = await fetch(`${API_BASE}/digilocker/verify-qr`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Multi-Channel Notifications (FR-4.6, §6.8)
  getNotifications: async (recipientId?: string) => {
    const qs = recipientId ? `?recipientId=${encodeURIComponent(recipientId)}` : '';
    const res = await fetch(`${API_BASE}/notifications${qs}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  markNotificationRead: async (id: string) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },
  sendTestNudge: async (payload: { recipientId: string; channel?: string; title: string; message: string }) => {
    const res = await fetch(`${API_BASE}/notifications/test-nudge`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
