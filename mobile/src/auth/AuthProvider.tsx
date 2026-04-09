import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ledgerApi, setAuthToken } from "../api/client";
import type { AuthResponse, LedgerUser } from "../types";

const STORAGE_KEY = "ledger.mobile.session";

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  user: LedgerUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(payload: AuthResponse) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: payload.access_token, user: payload.user }),
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LedgerUser | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          if (active) {
            setReady(true);
          }
          return;
        }

        const parsed = JSON.parse(raw) as { token?: string; user?: LedgerUser };
        if (!parsed.token) {
          if (active) {
            setReady(true);
          }
          return;
        }

        setAuthToken(parsed.token);
        const sessionUser = await ledgerApi.getCurrentUser();
        if (active) {
          setToken(parsed.token);
          setUser(sessionUser);
        }
      } catch {
        setAuthToken(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      token,
      user,
      async signIn(email, password) {
        const response = await ledgerApi.login({ email, password });
        setAuthToken(response.access_token);
        await persistSession(response);
        setToken(response.access_token);
        setUser(response.user);
      },
      async signUp(name, email, password) {
        const response = await ledgerApi.signUp({ name, email, password });
        setAuthToken(response.access_token);
        await persistSession(response);
        setToken(response.access_token);
        setUser(response.user);
      },
      async signOut() {
        setAuthToken(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [ready, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
