import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MNU — Student Management System",
  description:
    "The official Student Management System of Minya National University (MNU). Manage academic records, grades, attendance, and transcripts — all in one secure, modern platform. Made by Abdelhmeed Elshorbagy.",
  authors: [
    {
      name: "Abdelhmeed Elshorbagy",
      url: "https://www.shorbagy.space/",
    },
  ],
  creator: "Abdelhmeed Elshorbagy",
  openGraph: {
    title: "MNU — Student Management System",
    description:
      "The official Student Management System of Minya National University. Manage grades, attendance, and transcripts securely in one place.",
    siteName: "MNU Student Management System",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 526,
        height: 536,
        alt: "Minya National University — Student Management System",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "MNU — Student Management System",
    description:
      "Official academic platform of Minya National University. Grades, attendance, and transcripts — all in one place.",
    images: ["/opengraph-image.png"],
    creator: "@AbdelhmeedE",
  },
  keywords: [
    "MNU",
    "Minya National University",
    "Student Management System",
    "SMS",
    "academic records",
    "grades",
    "attendance",
    "transcripts",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
