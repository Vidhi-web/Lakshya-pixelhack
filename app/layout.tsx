import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
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
  title: "Lakshya - Your Goal, Your Path, Your Success",
  description: "AI-powered goal execution platform for students and ambitious learners. Transform any goal — exams, placements, startups, or skill mastery — into structured roadmaps with adaptive AI guidance.",
  keywords: ["productivity", "goal tracking", "AI roadmap", "task management", "career planning", "competitive exams", "campus placements", "startup MVP", "higher studies"],
  authors: [{ name: "Lakshya Team" }],
  openGraph: {
    title: "Lakshya - Your Goal, Your Path, Your Success",
    description: "AI-powered goal execution platform designed for students and ambitious builders",
    type: "website",
  },
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
