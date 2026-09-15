"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Console header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--amber)",
                boxShadow: "0 0 0 3px rgba(242,169,59,0.15)",
                flexShrink: 0,
              }}
            />
            vinit.dev/admin
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            endpoint
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="method method-post"
              style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 5 }}
            >
              POST
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              /auth/login
            </span>
          </div>
        </div>

        {/* Login form panel */}
        <div className="console" style={{ overflow: "hidden" }}>
          <div className="console-bar">
            {["var(--rose)", "var(--amber)", "var(--teal)"].map((c, i) => (
              <span
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: c,
                  display: "inline-block",
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 10,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              admin authentication required
            </span>
          </div>

          <form onSubmit={handleLogin} style={{ padding: "28px 28px 24px" }}>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vinitmahale77@gmail.com"
                required
                autoComplete="email"
                id="admin-email"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="field-label">password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                id="admin-password"
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(224,112,112,0.08)",
                  border: "1px solid var(--rose-dim)",
                  borderRadius: 7,
                  padding: "10px 14px",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--rose)",
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
              id="admin-login-submit"
            >
              {loading ? "authenticating…" : "Authenticate →"}
            </button>
          </form>

          <div className="console-foot">
            <span>content-type: application/json</span>
            <span style={{ color: "var(--text-dim)" }}>owner-only access</span>
          </div>
        </div>

        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--text-dim)",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          <a href="/" style={{ color: "var(--teal)" }}>
            ← back to portfolio
          </a>
        </p>
      </div>
    </div>
  );
}
