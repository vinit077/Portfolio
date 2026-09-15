import React from "react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methodStyles: Record<Method, string> = {
  GET: "method-get",
  POST: "method-post",
  PUT: "method-patch",
  PATCH: "method-patch",
  DELETE: "method-delete",
};

export function MethodBadge({ method }: { method: string }) {
  const cls = methodStyles[(method as Method)] ?? "method-get";
  return <span className={`method ${cls}`}>{method}</span>;
}
