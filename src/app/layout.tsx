import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swasthya Mitra - Your AI Health Assistant",
  description: "Swasthya Mitra is an AI-powered health assistant that helps you manage your health, find doctors, check symptoms, and access healthcare services easily.",
  keywords: ["Swasthya Mitra", "Health AI", "AI Health Assistant", "Healthcare", "Medical Assistant", "Symptom Checker", "Doctor Consultation", "Health Records", "स्वास्थ्य मित्र", "Santé Ami", "Gesundheit Helfer"],
  authors: [{ name: "Swasthya Mitra Team" }],
  icons: {
    icon: "/aihealth.png",
  },
  openGraph: {
    title: "Swasthya Mitra - AI Health Assistant",
    description: "Your trusted AI companion for health management, doctor consultations, and medical insights",
    url: "https://swasthya-mitra.com",
    siteName: "Swasthya Mitra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swasthya Mitra - AI Health Assistant",
    description: "Your trusted AI companion for health management and medical insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
