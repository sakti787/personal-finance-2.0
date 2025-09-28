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
      <body className="antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
