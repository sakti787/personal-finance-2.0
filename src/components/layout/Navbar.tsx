'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname() || "";
  const navRef = useRef<HTMLElement>(null);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node) && menuOpen) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="w-full card-glass px-2 xl:px-4 py-2 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 xl:gap-4">
        <div className="flex items-center gap-2 xl:gap-4">
          <div>
            <h1 className="text-lg xl:text-xl font-bold text-primary leading-tight">UangSakti</h1>
            <p className="text-[10px] xl:text-xs text-muted-foreground leading-tight">Financial Tracker</p>
          </div>
          {/* Hamburger button for mobile */}
          <button
            className="xl:hidden ml-2 p-2 rounded hover:bg-primary/10 focus:outline-none"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Menu navigasi */}
          <nav ref={navRef} className={cn(
            // Full menu only shown on extra large screens to avoid truncation on half-desktop widths
            "ml-0 xl:ml-6",
            menuOpen ? "absolute left-0 top-14 w-full bg-black/70 backdrop-blur-lg z-[100] border border-white/10 shadow-xl rounded-lg mt-2" : "hidden",
            "xl:static xl:block"
          )}>
            <ul className={cn(
              "flex-col gap-1 p-2 xl:p-0 xl:flex-row xl:gap-2 flex",
              menuOpen ? "flex" : "hidden xl:flex"
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
                          ? "text-purple-600 bg-purple-100 font-semibold "
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
        <div className="flex items-center gap-2 xl:gap-3 min-w-0">
          <div className="text-xs xl:text-sm text-right truncate">
            <p className="font-medium truncate max-w-[90px] xl:max-w-[160px]">{user?.user_metadata?.username || user?.email}</p>
            <p className="text-muted-foreground text-[10px] xl:text-xs">Logged in</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}