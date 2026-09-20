"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StackCategory } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: "lang", label: "Languages" },
  { value: "front", label: "Frontend" },
  { value: "back", label: "Backend" },
  { value: "data", label: "Data" },
  { value: "tool", label: "Tooling" },
  { value: "concept", label: "Concepts" },
];

export function StackPanel() {
  const [categories, setCategories] = useState<StackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchStack();
  }, []);

  const fetchStack = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stack_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      showMessage("Failed to load stack data.", "error");
    } else if (data) {
      setCategories(data as StackCategory[]);
    }
    setLoading(false);
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateCategory = (index: number, field: keyof StackCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleChipsChange = (index: number, value: string) => {
    const chipsArray = value.split(",").map(c => c.trim()).filter(Boolean);
    handleUpdateCategory(index, "chips", chipsArray);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...categories];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCategories(updated);
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCategories(updated);
  };

  const addCategory = () => {
    const newCategory: StackCategory = {
      id: `new-${Date.now()}`, // temp id
      label: "New Category",
      category: "lang",
      chips: [],
      sort_order: categories.length,
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (index: number) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  const saveStack = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Fetch existing to handle deletes
      const { data: existingData } = await supabase.from("stack_categories").select("id");
      const existingIds = (existingData || []).map(r => r.id);
      
      const currentIds = categories.map(c => c.id).filter(id => !id.startsWith("new-"));
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (idsToDelete.length > 0) {
        await supabase.from("stack_categories").delete().in("id", idsToDelete);
      }

      // Upsert current records
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const record = {
          label: cat.label,
          category: cat.category,
          chips: cat.chips,
          sort_order: i, // updating sort order based on array position
        };

        if (cat.id.startsWith("new-")) {
          await supabase.from("stack_categories").insert([record]);
        } else {
          await supabase.from("stack_categories").update(record).eq("id", cat.id);
        }
      }
      
      showMessage("Stack updated successfully!", "success");
      fetchStack(); // Refresh with real IDs
    } catch (err) {
      console.error(err);
      showMessage("Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-dim)" }}>Loading stack...</div>;
  }

  return (
    <div className="card reveal">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600 }}>Stack Categories</h2>
        <button className="btn btn-teal" onClick={saveStack} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div
          style={{
            background: message.type === "success" ? "rgba(79, 209, 197, 0.1)" : "rgba(224, 112, 112, 0.1)",
            color: message.type === "success" ? "var(--teal)" : "var(--rose)",
            padding: "10px 14px",
            borderRadius: 6,
            fontFamily: "var(--mono)",
            fontSize: 13,
            marginBottom: 20,
            border: `1px solid ${message.type === "success" ? "var(--teal-dim)" : "var(--rose-dim)"}`
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {categories.map((cat, i) => (
          <div key={cat.id} style={{ background: "var(--panel-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto auto", gap: 12, alignItems: "center" }}>
            <div>
              <label className="field-label" style={{ fontSize: 10 }}>Label</label>
              <input
                className="field-input"
                style={{ padding: "6px 10px", fontSize: 12 }}
                value={cat.label}
                onChange={(e) => handleUpdateCategory(i, "label", e.target.value)}
              />
            </div>
            
            <div>
              <label className="field-label" style={{ fontSize: 10 }}>Color Category</label>
              <select
                className="field-input"
                style={{ padding: "6px 10px", fontSize: 12 }}
                value={cat.category}
                onChange={(e) => handleUpdateCategory(i, "category", e.target.value)}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" style={{ fontSize: 10 }}>Chips (comma separated)</label>
              <input
                className="field-input"
                style={{ padding: "6px 10px", fontSize: 12 }}
                value={cat.chips.join(", ")}
                onChange={(e) => handleChipsChange(i, e.target.value)}
                placeholder="React, Next.js, ..."
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button 
                className="btn btn-ghost" 
                style={{ padding: "2px 8px", fontSize: 10 }}
                onClick={() => moveUp(i)}
                disabled={i === 0}
              >▲</button>
              <button 
                className="btn btn-ghost" 
                style={{ padding: "2px 8px", fontSize: 10 }}
                onClick={() => moveDown(i)}
                disabled={i === categories.length - 1}
              >▼</button>
            </div>

            <button 
              className="btn btn-danger" 
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={() => removeCategory(i)}
            >
              Remove
            </button>
          </div>
        ))}

        <button 
          className="btn btn-ghost" 
          style={{ alignSelf: "flex-start", marginTop: 8 }}
          onClick={addCategory}
        >
          + Add Category
        </button>
      </div>
    </div>
  );
}
