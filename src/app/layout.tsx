import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Jost } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { storeFontVariables } from "@/lib/fonts/store-fonts";

import "./globals.css";
import "./store-external-fonts.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Luperini Store";

export const metadata: Metadata = {
  title: {
    default: storeName,
    template: `%s · ${storeName}`,
  },
  description: "E-commerce de produtos físicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} ${storeFontVariables} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
