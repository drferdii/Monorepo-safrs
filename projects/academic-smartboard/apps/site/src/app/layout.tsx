import { fontMono, fontSans } from "@sentra/token/fonts";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "El-Kayyisa — Sentra Smartboard System",
    template: "%s | El-Kayyisa",
  },
  description: "Bimbingan belajar personal dan terarah",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
