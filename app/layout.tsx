import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinit Mahale — Full Stack Developer",
  description:
    "Portfolio of Vinit A. Mahale — Java Full Stack Developer specialising in Spring Boot, React, and Flutter. Based in Pune, India. Open to work.",
  keywords: [
    "Vinit Mahale",
    "Full Stack Developer",
    "Spring Boot",
    "React",
    "Flutter",
    "Java",
    "Pune",
    "Software Engineer",
  ],
  authors: [{ name: "Vinit A. Mahale" }],
  openGraph: {
    title: "Vinit Mahale — Full Stack Developer",
    description:
      "Backend-solid, frontend-polished full stack engineering. Spring Boot · React · Flutter.",
    type: "website",
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
