import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/shared/Navigation";
import { ThemeWatcher } from "@/components/shared/ThemeWatcher";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Satisfactory Utils",
  description: "Factory planning and power management tools for Satisfactory",
  keywords: [
    "Satisfactory",
    "factory planner",
    "production calculator",
    "power planner",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeWatcher />
        <Suspense
          fallback={
            <div className="sticky top-0 z-50 border-b border-border bg-background/95 px-4 py-3 text-sm text-muted-foreground">
              Loading navigation…
            </div>
          }
        >
          <Navigation />
        </Suspense>
        <main id="main-content" className="container mx-auto px-4 py-8">
          <Suspense fallback={<div className="py-8 text-center">Loading…</div>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
