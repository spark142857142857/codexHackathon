import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Signal Atlas — Public signals and real market reactions",
  description: "Explore real asset prices around reviewed public signals without prediction or causality claims.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
