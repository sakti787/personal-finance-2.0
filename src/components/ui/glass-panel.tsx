import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassPanel
 * Reusable translucent glassy container with subtle gradient ring overlay.
 * - Provides backdrop blur & layered gradient ring via ::before pseudo
 * - Accepts width / height constraints through className override
 */
export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border border-white/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/5 dark:supports-[backdrop-filter]:bg-neutral-900/10 bg-white/8 dark:bg-neutral-900/20',
          // gradient + ring overlay
          "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:ring-1 before:ring-white/10 before:pointer-events-none before:bg-gradient-to-br before:from-white/10 before:to-transparent dark:before:from-white/5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = 'GlassPanel';
