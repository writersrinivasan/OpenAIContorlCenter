import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Control Center Hub",
  description:
    "Learn how OpenAI-style agent control centers work: identity, guardrails, approvals, containment, a live guardrail lab, a dated timeline and a cross-vendor comparison — with a BYOK Groq AI assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
