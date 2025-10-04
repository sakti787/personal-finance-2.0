import type { Metadata } from "next";
import "./globals.css";
import PlexusBackground from '@/components/PlexusBackground';

export const metadata: Metadata = {
  title: "UangSakti - Personal Finance Tracker",
  description: "Modern personal finance tracking app for young Indonesians",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="antialiased font-sans overflow-x-hidden h-full">
        {/* NOTE: Removed transform/perspective classes so the fixed PlexusBackground canvas spans full scroll height */}
        <div className="aurora-background min-h-screen relative z-0">
          {/* Global animated background (single instance) */}
          <PlexusBackground />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </div>
        {/* DialogPortal nodes will mount here at end of body, outside transform context */}
      </body>
    </html>
  );
}
