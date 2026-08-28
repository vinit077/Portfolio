"use client";

import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

const contactLinks = [
  {
    label: "email",
    value: "vinitmahale77@gmail.com",
    href: "mailto:vinitmahale77@gmail.com",
  },
  {
    label: "linkedin",
    value: "/in/vinit-mahale77",
    href: "https://www.linkedin.com/in/vinit-mahale77/",
  },
  {
    label: "github",
    value: "/vinit077",
    href: "https://github.com/vinit077",
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="section-wrap"
      style={{ borderBottom: "none" }}
    >
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="POST" />
            <span className="path">/contact</span>
          </div>
        </div>
        <div
          className="reveal"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius)",
            padding: 34,
          }}
        >
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 15,
              maxWidth: "60ch",
            }}
          >
            Open to full-stack and backend-leaning roles. The fastest way in is
            email — everything below routes straight to Vinit.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginTop: 22,
            }}
          >
            {contactLinks.map(({ label, value, href }) => (
              <a
                key={label}
                href={href}
                target={label !== "email" ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "14px 16px",
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--teal-dim)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)")
                }
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "13.5px",
                      marginTop: 4,
                    }}
                  >
                    {value}
                  </div>
                </div>
                <span
                  style={{
                    color: "var(--teal)",
                    fontFamily: "var(--mono)",
                    fontSize: 15,
                  }}
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          #contact .reveal > div[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
