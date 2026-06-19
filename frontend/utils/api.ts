import { AuthResponse, Trip, CreateTripFormData } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token');
};

export const setToken = (token: string): void => {
  sessionStorage.setItem('token', token);
};

export const removeToken = (): void => {
  sessionStorage.removeItem('token');
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred.');
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }, false),

  login: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false),

  googleLogin: (credential: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }, false),

  getMe: () =>
    apiFetch<{ id: string; name: string; email: string }>('/api/auth/me'),
};

// ─── Trips API ────────────────────────────────────────────────────────────────
export const tripsApi = {
  getAll: (): Promise<Trip[]> =>
    apiFetch<Trip[]>('/api/trips'),

  getById: (id: string): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${id}`),

  getPublicById: (id: string): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/public/${id}`, {}, false),

  generate: (formData: any): Promise<Trip> =>
    apiFetch<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  update: (id: string, updates: Partial<Trip>): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>(`/api/trips/${id}`, {
      method: 'DELETE',
    }),

  regenerateDay: (id: string, dayNumber: number, userFeedback: string): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${id}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, userFeedback }),
    }),

  duplicate: (id: string): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${id}/duplicate`, {
      method: 'POST',
    }),

  chat: (id: string, message: string): Promise<{ response: string; chatHistory: any[] }> =>
    apiFetch<{ response: string; chatHistory: any[] }>(`/api/trips/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getWeather: (id: string): Promise<any> =>
    apiFetch<any>(`/api/trips/${id}/weather`),

  getRecommendations: (id: string): Promise<any[]> =>
    apiFetch<any[]>(`/api/trips/${id}/recommendations`),

  regeneratePacking: (id: string, options: { travelStyle: string; season: string; weather: string }): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${id}/regenerate-packing`, {
      method: 'POST',
      body: JSON.stringify(options),
    }),
};
