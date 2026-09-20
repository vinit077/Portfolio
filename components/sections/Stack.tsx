import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { StackList } from "@/components/sections/StackList";
import { createClient } from "@/lib/supabase/server";
import type { StackCategory } from "@/lib/utils";

const fallbackGroups: StackCategory[] = [
  { id: "1", sort_order: 0, label: "languages", category: "lang", chips: ["Java", "SQL", "JavaScript", "Dart", "HTML5", "CSS3"] },
  { id: "2", sort_order: 1, label: "frontend", category: "front", chips: ["React.js", "Next.js"] },
  { id: "3", sort_order: 2, label: "backend", category: "back", chips: ["Spring Boot", "Spring Security", "Spring MVC", "Node.js", "Express.js"] },
  { id: "4", sort_order: 3, label: "data", category: "data", chips: ["MySQL", "MongoDB", "PostgreSQL", "Firebase", "Supabase"] },
  { id: "5", sort_order: 4, label: "tooling", category: "tool", chips: ["Git", "GitHub", "Docker", "Swagger", "VS Code", "Android Studio"] },
  { id: "6", sort_order: 5, label: "concepts", category: "concept", chips: ["OOP", "DSA", "REST APIs", "JWT Auth", "Hibernate", "CRUD"] },
];

export async function Stack() {
  const supabase = await createClient();
  let groups = fallbackGroups;

  try {
    const { data, error } = await supabase
      .from("stack_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      groups = data as StackCategory[];
    }
  } catch (err) {
    console.error("Failed to fetch stack categories", err);
  }

  return (
    <section id="stack" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="GET" />
            <span className="path">/stack</span>
          </div>
        </div>
        <StackList groups={groups} />
      </div>
    </section>
  );
}
