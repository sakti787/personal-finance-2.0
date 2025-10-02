'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import type { AuthState } from '@/lib/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';

type AuthProviderProps = {
  children: React.ReactNode;
};


import type { AuthActions } from '@/lib/store/auth-store';
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function useAuth(): AuthState & AuthActions {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authStore = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const hasCheckedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasCheckedRef.current) {
      setIsCheckingSession(false);
      return;
    }
    hasCheckedRef.current = true;
    let cancelled = false;
    const run = async () => {
      try {
        await authStore.checkSession();
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    };
    timeoutRef.current = window.setTimeout(() => {
      if (!cancelled) setIsCheckingSession(false);
    }, 6000);
    run();
    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [authStore]);

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isCheckingSession) {
      if (pathname) {
        const isProtectedRoute = pathname.startsWith('/dashboard');
        if (isProtectedRoute && !authStore.user) {
          router.push('/auth/login');
        } else if (pathname.startsWith('/auth') && authStore.user) {
          router.push('/dashboard');
        }
      }
    }
  }, [authStore.user, isCheckingSession, pathname, router]);

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
}