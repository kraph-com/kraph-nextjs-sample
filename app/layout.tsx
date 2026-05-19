import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kraph · Next.js + Supabase demo",
  description:
    "Server-rendered Next.js app reading from a Kraph-hosted Supabase instance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
