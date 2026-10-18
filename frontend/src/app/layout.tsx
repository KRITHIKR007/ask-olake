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
      <body className="antialiased bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
