'use client';

import React from 'react';

// Global loading UI shown during route-level suspense (initial load / refresh)
export default function RootLoading() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background now provided globally in layout */}
      {/* Optional subtle radial overlay to match other pages */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/30 border-t-primary"></div>
        <p className="text-sm text-muted-foreground tracking-wide">Loading your finance dashboard...</p>
      </div>
    </div>
  );
}
