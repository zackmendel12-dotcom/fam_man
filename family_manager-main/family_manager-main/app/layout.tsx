import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "@/providers/root-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BaseFam - Smart Family Wallet",
  description: "Empower your family with on-chain allowances and spending management on Base",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
