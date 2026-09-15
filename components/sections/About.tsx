import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

export function About() {
  return (
    <section id="about" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <MethodBadge method="GET" />
            <span className="path">/about</span>
          </div>
        </div>
        <div className="card about-card reveal">
          <p style={{ color: "var(--text-muted)", fontSize: "15.5px", maxWidth: "70ch" }}>
            Vinit is a software developer with a strong foundation in Java, SQL,
            and full-stack application development. He&apos;s an MCA graduate who
            builds scalable web and mobile applications, with particular depth in
            authentication, database integration, and interfaces that feel
            considered rather than default.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "15.5px",
              maxWidth: "70ch",
              marginTop: 14,
            }}
          >
            He&apos;s equally comfortable writing a Spring Boot service, wiring up a
            React dashboard, or shipping a Flutter mobile module — and he cares
            about the layer where those pieces actually meet.
          </p>
        </div>
      </div>
    </section>
  );
}
