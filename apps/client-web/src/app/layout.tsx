import "./globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import AppProviders from "./providers";

export const metadata: Metadata = {
  title: "Oficios Ya",
  description: "El lugar donde ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen">
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
