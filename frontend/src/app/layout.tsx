import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JollyRoger.AI — The High-Seas AI Career Co-Pilot",
  description: "Navigate ML, System Design, and MLOps curriculum tracks powered by Coral SQL.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grid-bg">{children}</body>
    </html>
  );
}


