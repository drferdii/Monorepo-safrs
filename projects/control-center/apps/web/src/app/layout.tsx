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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
