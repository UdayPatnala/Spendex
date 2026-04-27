import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AnalyticsData,
  AuthResponse,
  BudgetScreenData,
  HomeOverview,
  SpedexUser,
  PaymentIntentResponse,
  Vendor,
  VendorDirectoryData,
} from "../types";

// In production set EXPO_PUBLIC_API_BASE_URL=https://spedex.onrender.com/api in your .env or EAS secrets.
// Falls back to localhost (desktop) or 10.0.2.2 (Android emulator) for local dev.
const API_BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ??
  Platform.select({
    android: "http://10.0.2.2:8000/api",
    default: "http://localhost:8000/api",
  }) ??
  "http://localhost:8000/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let token = authToken;
  if (!token) {
    try {
      const raw = await AsyncStorage.getItem("spedex.mobile.session");
      if (raw) {
        const parsed = JSON.parse(raw);
        token = parsed.token || null;
      }
    } catch (e) {
      // ignore
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  completePayment: (transactionId: number, status: string) =>
    request<any>(`/payments/${transactionId}/complete`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  addVendor: (payload: { name: string; category?: string; phone_number?: string; upi_handle?: string; default_amount?: number; is_quick_pay?: boolean }) =>
    request<{ status: string; vendor: Vendor }>("/mobile/vendors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  editVendor: (id: number, payload: { name?: string; category?: string; upi_handle?: string; phone_number?: string; default_amount?: number; is_quick_pay?: boolean }) =>
    request<{ status: string; vendor: Vendor }>(`/mobile/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateProfile: (payload: { name?: string; profile_picture_url?: string }) =>
    request<SpedexUser>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
