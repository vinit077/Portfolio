import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

export function Experience() {
  return (
    <section id="experience" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="GET" />
            <span className="path">/experience</span>
          </div>
        </div>
        <div
          className="reveal"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius)",
            padding: "30px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 19,
                  fontWeight: 600,
                }}
              >
                Software Development Intern
              </div>
              <div
                style={{
                  color: "var(--amber)",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                }}
              >
                Saral Events
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-dim)",
              }}
            >
              May 2025 — Feb 2026
            </div>
          </div>
          <ul style={{ listStyle: "none" }}>
            {[
              "Developed and maintained cross-platform software for an event management platform using Flutter and Dart.",
              "Integrated Supabase authentication and real-time database services for secure user management and data sync.",
              "Migrated application modules from FlutterFlow to a structured Flutter codebase, improving maintainability.",
              "Collaborated with the development team to optimize performance and ship production-ready features.",
            ].map((bullet) => (
              <li
                key={bullet}
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14.5px",
                  paddingLeft: 20,
                  position: "relative",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: "var(--teal)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  →
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
