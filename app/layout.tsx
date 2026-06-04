import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Car Sales CRM",
  description: "Lightweight car sales lead management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header
          style={{
            borderBottom: "1px solid #ddd",
            background: "var(--background)",
          }}
        >
          <div
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>
              Car Sales CRM
            </Link>
            <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }} aria-label="Main navigation">
              <Link href="/">Lead Capture</Link>
              <Link href="/leads">Leads</Link>
            </nav>
          </div>
        </header>
        <main style={{ width: "100%", maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
