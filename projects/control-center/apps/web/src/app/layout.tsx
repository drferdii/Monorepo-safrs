import { fontMono, fontSans } from "@sentra/token/fonts";
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
    // Geist comes from @sentra/token, the single source for font binaries in
    // this repository. The board's own @font-face rules pointed at a /fonts
    // directory that only existed in its previous deployment.
    <html lang="id">
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
