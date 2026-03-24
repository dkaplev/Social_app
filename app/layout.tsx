import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { DebugStatus } from "@/components/DebugStatus";
import { DemoSeedForm } from "@/components/DemoSeedForm";
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
  title: {
    default: "Warm",
    template: "%s · Warm",
  },
  description:
    "Plan meetups with friends: temperature, suggestions, invites, and calendar.",
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
      <body className="flex min-h-full flex-col font-sans">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <DemoSeedForm />
        <DebugStatus />
      </body>
    </html>
  );
}
