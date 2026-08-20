import { fontMono, fontSans } from "@sentra/token/fonts";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sentra Smartboard", template: "%s | Sentra Smartboard" },
  description: "Platform bimbingan belajar multi-tenant El-Kayyisa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
