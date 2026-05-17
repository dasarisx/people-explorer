import { getJson } from "./client";

export function createJob({label, clientId}) {
  return getJson("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, clientId }),
  });
}
