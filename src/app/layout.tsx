import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthNav } from "@/components/auth/auth-nav";
import { Logo } from "@/components/logo";
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
  title: "OneTake — One perfect take, guaranteed",
  description:
    "Tell OneTake what your video must cover and how long it can be. It tracks your points while you record, patches anything you missed, and fits it to the limit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
            <Logo />
            <AuthNav />
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}