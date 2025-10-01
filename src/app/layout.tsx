import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {/* Background + any transforms moved off <body> so fixed portals (Dialog) aren't affected */}
        <div className="aurora-background transform-gpu will-change-transform will-change-[opacity,transform] backface-hidden [perspective:1000px] min-h-screen relative z-0">
          <main className="relative z-10 p-8">
            {children}
          </main>
        </div>
        {/* DialogPortal nodes will mount here at end of body, outside transform context */}
      </body>
    </html>
  );
}
