import React from "react";

export function StructuredData() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://vinitmahale.dev/#person",
    name: "Vinit A. Mahale",
    alternateName: ["Vinit Mahale", "vinit077"],
    url: "https://vinitmahale.dev",
    jobTitle: "Java Full Stack Developer",
    description:
      "Java Full Stack Developer specialising in Spring Boot, React, Flutter, and REST APIs. Based in Pune, India.",
    knowsAbout: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "Spring MVC",
      "Hibernate",
      "React.js",
      "Next.js",
      "Flutter",
      "Dart",
      "RESTful APIs",
      "SQL",
      "MySQL",
      "PostgreSQL",
      "Supabase",
      "Docker",
      "Data Structures and Algorithms",
    ],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "M.E.S. Institute of Management and Career Courses, Pune",
    },
    sameAs: [
      "https://github.com/vinit077",
      "https://www.linkedin.com/in/vinit-mahale77/",
      "https://leetcode.com/u/vinit077/",
      "https://codeforces.com/profile/vinit077",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://vinitmahale.dev/#website",
    url: "https://vinitmahale.dev",
    name: "Vinit Mahale — Full Stack Developer Portfolio",
    description:
      "Backend-solid, frontend-polished full stack engineering portfolio of Vinit Mahale.",
    author: {
      "@id": "https://vinitmahale.dev/#person",
    },
    inLanguage: "en-US",
  };

  const profilePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://vinitmahale.dev/#profilepage",
    url: "https://vinitmahale.dev",
    name: "Vinit Mahale's Developer Portfolio",
    isPartOf: {
      "@id": "https://vinitmahale.dev/#website",
    },
    mainEntity: {
      "@id": "https://vinitmahale.dev/#person",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
    </>
  );
}
