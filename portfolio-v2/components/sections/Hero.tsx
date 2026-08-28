"use client";

import React, { useEffect, useRef } from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

const jsonLines: [string, string][] = [
  ["{", ""],
  ['  "name"', '"Vinit A. Mahale"'],
  ['  "role"', '"Java Full Stack Developer"'],
  ['  "based_in"', '"Pune, India"'],
  ['  "focus"', '["Spring Boot", "React", "REST APIs"]'],
  ['  "status"', '"open_to_work"'],
  ["}", ""],
];

function renderLineHTML(key: string, val: string): string {
  if (val === "") {
    return `<span style="color:var(--text-dim)">${key}</span>`;
  }
  return `<span style="color:var(--teal)">${key}</span><span style="color:var(--text-dim)">: </span><span style="color:var(--amber)">${val}</span><span style="color:var(--text-dim)">,</span>`;
}

export function Hero() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const body = bodyRef.current;
    const status = statusRef.current;
    if (!body || !status) return;

    if (prefersReduced) {
      jsonLines.forEach(([k, v]) => {
        const div = document.createElement("div");
        div.innerHTML = renderLineHTML(k, v);
        div.style.whiteSpace = "pre";
        body.appendChild(div);
      });
      status.textContent = "200 OK · 38ms";
      return;
    }

    // Create blinking caret
    const caret = document.createElement("span");
    caret.style.cssText =
      "display:inline-block;width:7px;height:14px;background:var(--amber);vertical-align:middle;animation:blink 1s step-start infinite;";
    body.appendChild(caret);

    let i = 0;
    const step = () => {
      if (i < jsonLines.length) {
        const [k, v] = jsonLines[i];
        const div = document.createElement("div");
        div.innerHTML = renderLineHTML(k, v);
        div.style.whiteSpace = "pre";
        body.insertBefore(div, caret);
        i++;
        setTimeout(step, 130);
      } else {
        caret.remove();
        status.textContent = "200 OK · 38ms";
      }
    };
    setTimeout(step, 350);
  }, []);

  return (
    <section
      className="hero"
      style={{
        padding: "88px 0 100px",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        {/* Left: text */}
        <div>
          <div className="eyebrow">request received</div>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: "clamp(34px,5vw,52px)",
              lineHeight: 1.08,
              marginBottom: 20,
            }}
          >
            Backend-solid, frontend-polished{" "}
            <span style={{ color: "var(--amber)" }}>full stack</span>{" "}
            engineering.
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "16.5px",
              maxWidth: "46ch",
              marginBottom: 30,
            }}
          >
            Vinit Mahale builds web and mobile products end to end — Spring Boot
            APIs underneath, React and Flutter interfaces on top, and
            authentication that actually holds up.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="mailto:vinitmahale77@gmail.com">
              Email me →
            </a>
            <a
              className="btn"
              href="https://github.com/vinit077"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source
            </a>
            <a
              className="btn btn-ghost"
              href="https://www.linkedin.com/in/vinit-mahale77/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Right: console */}
        <div className="console reveal">
          <div className="console-bar">
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "var(--border)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "var(--border)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "var(--border)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                marginLeft: 10,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-muted)",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <MethodBadge method="GET" /> /developers/vinit-mahale
            </span>
          </div>

          <div
            className="console-body"
            ref={bodyRef}
            style={{ fontFamily: "var(--mono)", fontSize: 13, minHeight: 230 }}
          />

          <div className="console-foot">
            <span>content-type: application/json</span>
            <span ref={statusRef} style={{ color: "var(--teal)", fontWeight: 600 }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hero .wrap { grid-template-columns: 1fr !important; }
          .hero .console { display: none; }
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </section>
  );
}
