"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "about" },
  { href: "#stack", label: "stack" },
  { href: "#experience", label: "experience" },
  { href: "#projects", label: "projects" },
  { href: "#coding-profile", label: "coding" },
  { href: "#credentials", label: "credentials" },
  { href: "#contact", label: "contact" },
];

export function Header() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const onScroll = () => {
      let cur = "";
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) cur = sec.id;
      });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(13,20,31,0.86)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <nav className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--teal)",
              boxShadow: "0 0 0 3px rgba(79,209,197,0.15)",
              animation: "pulse 2.4s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          vinit.dev/v2
        </Link>

        {/* Nav links */}
        <div
          className="navlinks"
          style={{
            display: "flex",
            gap: 28,
            fontFamily: "var(--mono)",
            fontSize: "12.5px",
            color: "var(--text-muted)",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                transition: "color 0.15s ease",
                padding: "4px 0",
                color: active === href.slice(1) ? "var(--amber)" : undefined,
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            className="btn btn-ghost"
            href="https://github.com/vinit077"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a className="btn btn-primary" href="#contact">
            Contact
          </a>
        </div>
      </nav>

      <style>{`
        @media (max-width: 760px) { .navlinks { display: none !important; } }
      `}</style>
    </header>
  );
}
