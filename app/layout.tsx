import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

/**
 * One family throughout. Archivo's grotesque figures hold their width in
 * tables and its heavier weights carry the contract rail without needing a
 * second display face.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "vivo Hire Purchase · Merchant",
  description: "Device installment origination and servicing for vivo East Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={archivo.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
