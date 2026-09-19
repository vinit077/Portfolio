import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vinitmahale.dev";

export const viewport: Viewport = {
  themeColor: "#0D141F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vinit Mahale — Java Full Stack Developer",
    template: "%s | Vinit Mahale",
  },
  description:
    "Portfolio of Vinit A. Mahale — Java Full Stack Developer specialising in Spring Boot, React, and Flutter. Based in Pune, India. Open to work.",
  applicationName: "Vinit Mahale Portfolio",
  keywords: [
    "Vinit Mahale",
    "Vinit A Mahale",
    "Full Stack Developer",
    "Java Developer",
    "Spring Boot Developer",
    "React Developer",
    "Flutter Developer",
    "Software Engineer Pune",
    "Java Backend Developer",
    "REST API Development",
    "Supabase",
    "MySQL",
    "PostgreSQL",
    "Pune",
  ],
  authors: [{ name: "Vinit A. Mahale", url: siteUrl }],
  creator: "Vinit A. Mahale",
  publisher: "Vinit A. Mahale",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Vinit Mahale — Java Full Stack Developer",
    description:
      "Backend-solid, frontend-polished full stack engineering. Spring Boot · React · Flutter · REST APIs.",
    siteName: "Vinit Mahale Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinit Mahale — Java Full Stack Developer",
    description:
      "Backend-solid, frontend-polished full stack engineering. Spring Boot · React · Flutter.",
    creator: "@vinitmahale77",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}

