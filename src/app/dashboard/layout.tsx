'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  // State untuk mobile menu (pindahkan ke atas agar tidak melanggar aturan hooks)
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname() || "";

  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar Atas */}
      <header className="w-full bg-card px-2 sm:px-4 py-2 border-b border-primary/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-primary leading-tight">UangSakti</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Financial Tracker</p>
            </div>
            {/* Hamburger button for mobile */}
            <button
              className="sm:hidden ml-2 p-2 rounded hover:bg-primary/10 focus:outline-none"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Menu navigasi */}
            <nav className={cn(
              "ml-0 sm:ml-6",
              menuOpen ? "absolute left-0 top-14 w-full bg-card z-20 border-b border-primary/20" : "hidden",
              "sm:static sm:block"
            )}>
              <ul className={cn(
                "flex-col gap-1 p-2 sm:p-0 sm:flex-row sm:gap-2 flex",
                menuOpen ? "flex" : "hidden sm:flex"
              )}>
                {/* Define nav items for easier mapping */}
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/dashboard/transactions", label: "Transactions" },
                  { href: "/dashboard/categories", label: "Categories" },
                  { href: "/dashboard/budgets", label: "Budgets" },
                  { href: "/dashboard/goals", label: "Goals" },
                  { href: "/dashboard/reports", label: "Reports" },
                ].map((item) => {
                  // Active if pathname matches or starts with href (for subroutes)
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 rounded-md transition-colors",
                          isActive
                            ? "text-orange-600 bg-orange-100 font-semibold underline underline-offset-4"
                            : "text-foreground hover:text-primary hover:bg-primary/10",
                        )}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="text-xs sm:text-sm text-right truncate">
              <p className="font-medium truncate max-w-[90px] sm:max-w-[160px]">{user?.user_metadata?.username || user?.email}</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs">Logged in</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      {/* Main Content */}
  <main className="flex-1 px-2 sm:px-4 py-2 w-full max-w-full overflow-x-auto">
        {children}
      </main>
    </div>
  );
}