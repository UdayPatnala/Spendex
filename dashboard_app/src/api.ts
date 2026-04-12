import type {
  AnalyticsData,
  AuthResponse,
  BudgetScreenData,
  DashboardOverview,
  SpedexUser,
  VendorDirectoryData,
} from "./types";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "/_/backend/api";
    }
  }

  return "http://localhost:8000/api";
}

const API_BASE_URL = resolveApiBaseUrl();
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `Request failed with ${response.status}`);
  }
  return response.json();
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signUp(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return request<SpedexUser>("/auth/me");
}

export async function loadDashboardBundle() {
  const [overview, vendors, budget, analytics] = await Promise.all([
    request<DashboardOverview>("/dashboard/overview"),
    request<VendorDirectoryData>("/mobile/vendors"),
    request<BudgetScreenData>("/mobile/budgets"),
    request<AnalyticsData>("/mobile/analytics"),
  ]);

  return { overview, vendors, budget, analytics };
}
