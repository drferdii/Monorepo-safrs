import {
  fontMonoJetBrains,
  fontSansArchivo,
} from "@sentra/token/fonts-archivo";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sentra Control Center",
  description:
    "Pusat kendali repository Monorepo: seluruh fitur, statusnya yang sebenarnya, dan langkah berikutnya yang aman.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Archivo + JetBrains Mono, the typefaces the design system specifies. The
    // width axis carries the display voice, so no second family is needed.
    <html lang="id">
      <body
        className={`${fontSansArchivo.variable} ${fontMonoJetBrains.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
