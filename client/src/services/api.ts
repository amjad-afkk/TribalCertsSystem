const API_BASE = 'http://localhost:4000/api';

export const api = {
  // Schemes
  getSchemes: async () => {
    const res = await fetch(`${API_BASE}/schemes`);
    return res.json();
  },
  getSchemeById: async (id: string) => {
    const res = await fetch(`${API_BASE}/schemes/${id}`);
    return res.json();
  },
  createScheme: async (schemeData: any) => {
    const res = await fetch(`${API_BASE}/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemeData)
    });
    return res.json();
  },

  // Simulator
  runSimulator: async (criteria: any) => {
    const res = await fetch(`${API_BASE}/simulator/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    return res.json();
  },

  // Applications
  getApplications: async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/applications${qs}`);
    return res.json();
  },
  getApplicationById: async (id: string) => {
    const res = await fetch(`${API_BASE}/applications/${id}`);
    return res.json();
  },
  submitApplication: async (payload: any) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  resubmitDeficiency: async (id: string, payload: { explanation: string }) => {
    const res = await fetch(`${API_BASE}/applications/${id}/resubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Verification review
  reviewApplication: async (id: string, payload: any) => {
    const res = await fetch(`${API_BASE}/applications/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Document OCR extraction & check
  extractAndVerifyDocument: async (payload: any) => {
    const res = await fetch(`${API_BASE}/documents/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Selection Waterfalls
  runWaterfallSimulation: async (payload?: any) => {
    const res = await fetch(`${API_BASE}/selection/waterfall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    return res.json();
  },
  runNosSelection: async () => {
    const res = await fetch(`${API_BASE}/selection/nos`);
    return res.json();
  },
  signOffSelection: async (payload: any) => {
    const res = await fetch(`${API_BASE}/selection/sign-off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // Applicants
  getApplicants: async () => {
    const res = await fetch(`${API_BASE}/applicants`);
    return res.json();
  }
};
