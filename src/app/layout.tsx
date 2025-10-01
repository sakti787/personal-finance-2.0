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
      {/* Added GPU compositing hacks (transform-gpu & will-change) to preserve animated background under mobile dropdown portals */}
      <body className="antialiased font-sans aurora-background transform-gpu will-change-transform will-change-[opacity,transform] backface-hidden [perspective:1000px]">
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
