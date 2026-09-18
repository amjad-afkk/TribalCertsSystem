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
  }
};
