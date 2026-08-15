import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserProfile, AuthResponse } from '@personal-finance/types';
import { createApiClient, ApiClient } from '@personal-finance/api-client';
import { getAppConfig } from '@personal-finance/config';
import { getDatabase } from '../database/client';
import { AuthRepository, type AuthSessionRecord } from '../repositories/auth-repository';

export interface AuthContextValue {
  session: AuthSessionRecord | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  apiClient: ApiClient;
  login: (email: string, passwordPlain: string) => Promise<AuthResponse>;
  register: (email: string, passwordPlain: string, displayName?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionRecord | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRepo, setAuthRepo] = useState<AuthRepository | null>(null);

  const getRepo = async (): Promise<AuthRepository> => {
    if (authRepo) return authRepo;
    const db = await getDatabase();
    const repo = new AuthRepository(db);
    setAuthRepo(repo);
    return repo;
  };

  // ApiClient configured with dynamic bearer token provider
  const apiClient = React.useMemo(() => {
    return createApiClient({
      baseUrl: getAppConfig().apiUrl,
      getAuthToken: async () => {
        const repo = await getRepo();
        const current = await repo.getSession();
        return current?.accessToken ?? null;
      },
    });
  }, [authRepo]);

  // Load existing session on boot
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const repo = await getRepo();
        const savedSession = await repo.getSession();
        if (mounted && savedSession) {
          setSession(savedSession);
          setUser({
            id: savedSession.userId,
            email: savedSession.email,
            displayName: savedSession.displayName,
            createdAt: savedSession.createdAt,
            updatedAt: savedSession.updatedAt,
          });
        }
      } catch {
        // Fallback to guest mode
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, passwordPlain: string): Promise<AuthResponse> => {
    const res = await apiClient.auth.login({ email: email.trim(), password: passwordPlain });
    const now = new Date().toISOString();
    const repo = await getRepo();

    const newSession: AuthSessionRecord = {
      id: `session-${res.user.id}`,
      userId: res.user.id,
      email: res.user.email,
      displayName: res.user.displayName ?? null,
      accessToken: res.tokens.accessToken,
      refreshToken: res.tokens.refreshToken ?? null,
      lastSyncedRevision: 0,
      createdAt: now,
      updatedAt: now,
    };

    await repo.saveSession(newSession);
    setSession(newSession);
    setUser(res.user);
    return res;
  };

  const register = async (
    email: string,
    passwordPlain: string,
    displayName?: string,
  ): Promise<AuthResponse> => {
    const res = await apiClient.auth.register({
      email: email.trim(),
      password: passwordPlain,
      displayName: displayName?.trim() || undefined,
    });
    const now = new Date().toISOString();
    const repo = await getRepo();

    const newSession: AuthSessionRecord = {
      id: `session-${res.user.id}`,
      userId: res.user.id,
      email: res.user.email,
      displayName: res.user.displayName ?? null,
      accessToken: res.tokens.accessToken,
      refreshToken: res.tokens.refreshToken ?? null,
      lastSyncedRevision: 0,
      createdAt: now,
      updatedAt: now,
    };

    await repo.saveSession(newSession);
    setSession(newSession);
    setUser(res.user);
    return res;
  };

  const logout = async (): Promise<void> => {
    const repo = await getRepo();
    await repo.clearSession();
    setSession(null);
    setUser(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!session) return;
    try {
      const profile = await apiClient.auth.me();
      setUser(profile);
    } catch {
      // offline or token expired
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated: !!session && !!user,
        loading,
        apiClient,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
