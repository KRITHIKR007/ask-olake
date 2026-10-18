import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ask OLake — AI Documentation Assistant",
  description:
    "Ask OLake is an AI-powered technical documentation assistant that helps developers understand, configure, deploy, and troubleshoot OLake — the fastest open-source tool for replicating databases to Apache Iceberg.",
  keywords: [
    "OLake",
    "documentation",
    "AI assistant",
    "Apache Iceberg",
    "data replication",
    "CDC",
    "data lakehouse",
  ],
  icons: {
    icon: [
      { url: "/olake-logo.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/olake-logo.svg",
    apple: "/olake-logo.svg",
  },
  openGraph: {
    title: "Ask OLake — AI Documentation Assistant",
    description:
      "AI-powered assistant for OLake documentation. Get instant answers about connectors, sync modes, deployment, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/olake-logo.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/olake-logo.svg" />
      </head>
      <body className="antialiased bg-ambient-mesh min-h-screen text-foreground">
        {children}
      </body>
    </html>
  );
}
