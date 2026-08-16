import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Mover — Evidence behind market reactions",
  description: "Trace influential public statements to observable, benchmark-adjusted market reactions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

