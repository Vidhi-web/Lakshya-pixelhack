import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  description: "AI-powered productivity platform for Indian students. Transform your goals into structured roadmaps with personalized tasks, smart analytics, and weekly AI insights.",
  keywords: ["productivity", "goal tracking", "student planner", "AI roadmap", "task management", "study planner", "GATE preparation", "placement preparation"],
  authors: [{ name: "Lakshya Team" }],
  openGraph: {
    title: "Lakshya - Your Goal, Your Path, Your Success",
    description: "AI-powered productivity platform designed for Indian students",
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
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
