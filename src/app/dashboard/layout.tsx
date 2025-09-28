'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 px-2 sm:px-4 py-2 w-full max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}