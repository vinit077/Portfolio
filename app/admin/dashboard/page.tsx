"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ImportPanel } from "@/components/admin/ImportPanel";
import { ProjectsList } from "@/components/admin/ProjectsList";
import { CodingStatsPanel } from "@/components/admin/CodingStatsPanel";

type Tab = "import" | "projects" | "coding";

const tabs: { id: Tab; label: string; method: string; path: string }[] = [
  { id: "import", label: "Import Project", method: "POST", path: "/admin/projects/import" },
  { id: "projects", label: "All Projects", method: "GET", path: "/admin/projects" },
  { id: "coding", label: "Coding Stats", method: "GET", path: "/admin/coding-profile" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("import");
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  };

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Admin header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(13,20,31,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 14,
              fontWeight: 600,
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
                background: "var(--amber)",
                boxShadow: "0 0 0 3px rgba(242,169,59,0.15)",
                flexShrink: 0,
                animation: "pulse 2.4s ease-in-out infinite",
              }}
            />
            vinit.dev/admin
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              View site ↗
            </a>
            <button className="btn btn-danger" onClick={handleLogout} id="logout-btn">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: "40px 0 80px" }}>
        <div className="wrap">
          {/* Page title */}
          <div style={{ marginBottom: 32 }}>
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
              admin console
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className={`method method-${currentTab.method.toLowerCase()}`}
                style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 5 }}
              >
                {currentTab.method}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 16,
                  color: "var(--text-muted)",
                }}
              >
                {currentTab.path}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 28,
              borderBottom: "1px solid var(--border-soft)",
              paddingBottom: 16,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`tab-btn${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
                id={`tab-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "import" && (
            <ImportPanel
              onPublish={() => {
                setProjectsRefreshKey((k) => k + 1);
              }}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsList refreshKey={projectsRefreshKey} />
          )}
          {activeTab === "coding" && <CodingStatsPanel />}
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
