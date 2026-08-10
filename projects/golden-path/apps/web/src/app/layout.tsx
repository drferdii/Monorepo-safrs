import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Sentra type spec: Archivo, one family — the display voice comes from the
   width axis (--font-width-display: 112), not a second typeface. */
const archivo = Archivo({
  axes: ["wdth"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  description: "Pemeriksaan kesiapan alur SAFRS.",
  title: "Kesiapan SAFRS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${archivo.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
