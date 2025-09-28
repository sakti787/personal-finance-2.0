'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    // Check session on initial load
    const checkSession = async () => {
      await authStore.checkSession();
      setIsCheckingSession(false);
    };

    checkSession();
  }, []); // Remove authStore dependency to prevent infinite loop

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