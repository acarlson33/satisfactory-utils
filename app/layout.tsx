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
        <Navigation />
        <main id="main-content" className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
