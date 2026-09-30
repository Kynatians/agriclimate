import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { TopBar } from "@/components/shared/TopBar";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriClimate : NASA Satellite Climate Intelligence",
  description:
    "Empowering rural farmers and district agricultural officers with deterministic NASA satellite intelligence for agricultural resilience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--fg-primary)]">
        <QueryProvider>
          <OfflineBanner />
          <TopBar />
          <div className="flex-1 w-full">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
