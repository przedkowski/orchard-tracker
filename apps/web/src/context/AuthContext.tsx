import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { setToken } from "../api/client";
import * as authApi from "../api/auth";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from "./auth-context";

const TOKEN_KEY = "orchard_token";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => {
    // Synchronous initial decision: no token → definitely unauthenticated.
    // Token present → we need to verify it, so start in "loading".
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing) {
      setToken(existing);
      return "loading";
    }
    return "unauthenticated";
  });

  useEffect(() => {
    // Only runs the async verification if we started in "loading".
    if (status !== "loading") return;

    let cancelled = false;
    authApi
      .me()
      .then(({ user }) => {
        if (cancelled) return;
        setUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAuthResponse = (res: { token: string; user: User }) => {
    setToken(res.token);
    setUser(res.user);
    setStatus("authenticated");
  };

  const signIn = async (email: string, password: string) => {
    const res = await authApi.signIn({ email, password });
    applyAuthResponse(res);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await authApi.signUp({ email, password, name });
    applyAuthResponse(res);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  };

  const value: AuthContextValue = { user, status, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
