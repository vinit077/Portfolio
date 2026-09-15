import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

export function Credentials() {
  return (
    <section id="credentials" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="GET" />
            <span className="path">/credentials</span>
          </div>
        </div>
        <div
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          {/* Education */}
          <div className="card">
            <h3
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Education
            </h3>
            <div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "16.5px",
                  fontWeight: 600,
                }}
              >
                MCA — Master of Computer Applications
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13.5px",
                  marginTop: 4,
                }}
              >
                M.E.S. Institute of Management and Career Courses, Pune
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <h3
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Certifications
            </h3>
            <ul style={{ listStyle: "none" }}>
              {[
                { label: "Data Structures & Algorithms using Java — Infosys Springboard", yr: "2026" },
                { label: "Spring MVC — Infosys Springboard", yr: "2026" },
                { label: "Data Science Orientation — IBM Cognitive Class", yr: "2025" },
                { label: "Dart Programming — Infosys Springboard", yr: "2025" },
                { label: "Mobile App Development using Flutter — Infosys Springboard", yr: "2024" },
              ].map(({ label, yr }, i, arr) => (
                <li
                  key={label}
                  style={{
                    fontSize: "13.8px",
                    color: "var(--text-muted)",
                    padding: "9px 0",
                    borderBottom:
                      i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span>{label}</span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color: "var(--text-dim)",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {yr}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          #credentials .reveal[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
