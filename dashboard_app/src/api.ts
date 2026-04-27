import type {
  AnalyticsData,
  AuthResponse,
  BudgetScreenData,
  DashboardOverview,
  SpedexUser,
  Vendor,
  VendorCreate,
  VendorDirectoryData,
} from "./types";

const RENDER_API = "https://spedex.onrender.com/api";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return RENDER_API;
    }
  }

  return "http://localhost:8080/api";
}

const API_BASE_URL = resolveApiBaseUrl();
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let token = authToken;
  if (!token && typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("spedex.dashboard.session");
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.token || null;
      }
    } catch (e) {
      // ignore
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      "Cannot reach the Spedex server. It may be starting up - please wait a moment and try again.",
    );
  }

  if (!response.ok) {
    // Spring Boot can return { detail: "..." } (GlobalExceptionHandler) or
    // { message: "..." } (default Spring error page) or a field-error map.
    const payload = (await response.json().catch(() => null)) as Record<string, string> | null;

    const message =
      payload?.detail ??
      payload?.message ??
      (payload ? Object.values(payload)[0] : null) ??
      (response.status === 401
        ? "Incorrect email or password."
        : response.status === 404
          ? "Account not found. The server may have restarted - please sign up again."
          : `Request failed (${response.status})`);

    throw new Error(message);
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

export function addVendor(payload: VendorCreate) {
  return request<{ status: string; vendor: Vendor }>("/mobile/vendors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(payload: { name?: string; profile_picture_url?: string }) {
  return request<SpedexUser>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Ping the backend to wake it up from Render cold start */
export async function warmUpBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(15000) });
    return res.ok;
  } catch {
    return false;
  }
}

