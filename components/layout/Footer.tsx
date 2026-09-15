import React from "react";

export function Footer() {
  return (
    <footer style={{ padding: "40px 0 60px" }}>
      <div
        className="wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11.5px",
            color: "var(--text-dim)",
          }}
        >
          © 2026 Vinit Mahale. Built with intent — no template harmed.
        </p>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11.5px",
            color: "var(--text-dim)",
          }}
        >
          Pune, India ·{" "}
          <span style={{ color: "var(--teal)" }}>status: 200 open_to_work</span>
        </p>
      </div>
    </footer>
  );
}
