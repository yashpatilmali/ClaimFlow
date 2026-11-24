/**
 * Centralized typed API client for ClaimFlow AI.
 * Normalizes error handling and provides a uniform interface for TanStack Query.
 */

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Use fallback error message
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty or 204 responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Health & diagnostics
  getHealth: () => request<any>('/api/health'),

  // Claims
  getClaims: (params?: { status?: string; search?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return request<any[]>(`/api/claims${qs ? `?${qs}` : ''}`);
  },

  getClaim: (claimNumber: string) => request<any>(`/api/claims/${claimNumber}`),

  submitClaim: (formData: FormData) =>
    request<any>('/api/claims/submit', {
      method: 'POST',
      body: formData,
    }),

  runClaim: (claimNumber: string) =>
    request<any>(`/api/claims/${claimNumber}/run`, {
      method: 'POST',
    }),

  // HITL Review Queue
  getHitlQueue: () => request<any[]>('/api/hitl/queue'),

  submitHitlDecision: (
    claimNumber: string,
    payload: {
      decision: string;
      audit_note: string;
      override_payout_amount?: number;
      adjuster_id?: string;
    }
  ) =>
    request<any>(`/api/hitl/${claimNumber}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        adjuster_id: payload.adjuster_id || 'ADJ-10492',
        decision: payload.decision,
        audit_note: payload.audit_note,
        override_payout_amount: payload.override_payout_amount,
      }),
    }),

  // Demo Scenarios
  getScenarios: () => request<any[]>('/api/scenarios'),

  executeScenario: (scenarioId: string) =>
    request<any>(`/api/scenarios/${scenarioId}/execute`, {
      method: 'POST',
    }),

  // Operations Dashboard
  getKpis: () => request<any>('/api/dashboard/kpis'),

  // Test Kit & Demo Reset
  getTestPackets: () => request<any[]>('/api/test-kit/packets'),

  resetDemoData: () =>
    request<any>('/api/demo/reset', {
      method: 'POST',
    }),
};
