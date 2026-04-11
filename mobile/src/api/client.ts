import { Platform } from "react-native";

import type {
  AnalyticsData,
  AuthResponse,
  BudgetScreenData,
  HomeOverview,
  SpedexUser,
  PaymentIntentResponse,
  VendorDirectoryData,
} from "../types";

const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  default: "http://localhost:8000/api",
});

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
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

export const spedexApi = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signUp: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCurrentUser: () => request<SpedexUser>("/auth/me"),
  getHomeOverview: () => request<HomeOverview>("/mobile/home"),
  getBudgetScreen: () => request<BudgetScreenData>("/mobile/budgets"),
  getVendorDirectory: () => request<VendorDirectoryData>("/mobile/vendors"),
  getAnalytics: () => request<AnalyticsData>("/mobile/analytics"),
  preparePayment: (payload: { vendor_id?: number; amount: number; upi_handle?: string; payee_name?: string }) =>
    request<PaymentIntentResponse>("/payments/prepare", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
