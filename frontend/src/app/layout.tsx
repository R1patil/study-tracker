import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Tracker — ML & System Design",
  description: "Track ML, System Design, and MLOps progress",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grid-bg">{children}</body>
    </html>
  );
}


