/**
 * Legacy API client bridge.
 *
 * All new code should import from `../lib/api.js` directly.
 * This file re-exports from the new api layer for backward-compatibility
 * with pages that still `import { ... } from "../api/client"`.
 */

export {
  getIncidents,
  getIncident,
  createIncident,
  deleteIncident,
  signupAPI,
  loginAPI,
} from "../lib/api";

import { diagnoseIncident as _diagnose, getIncidents as _getIncidents, createIncident as _createIncident } from "../lib/api";

// Wrap diagnoseIncident to map backend response to what the UI expects
export async function diagnoseIncident(alertText) {
  const data = await _diagnose(alertText);
  return {
    root_cause: data.root_cause || "Unable to determine",
    confidence: data.confidence || 0,
    suggested_service: data.affected_subsystem || "unknown",
    suggested_severity: data.matches?.[0]?.severity || "MEDIUM",
    resolution_steps: data.resolution_steps || [],
    reasoning: data.reasoning || "",
    mttr_estimate_mins: null,
    similar_incidents: (data.matches || []).map((m) => ({
      id: m.id,
      incident_id: m.title,
      service_name: m.service || "unknown",
      severity: m.severity || "MEDIUM",
      root_cause: m.root_cause || "",
      resolution: m.resolution || "",
      match_score: m.similarity || 0,
    })),
  };
}

// Re-export the health check (hits root /health, not /api/v1)
import axios from "axios";

export async function getHealth() {
  const res = await axios.get(import.meta.env.VITE_API_URL + "/health");
  return res.data;
}

// Stats are computed client-side from the incidents list (backend no longer has /stats)
export async function getStats() {
  const result = await _getIncidents(0, 200);
  const incidents = result.incidents || [];
  const total = result.total || incidents.length;

  const resolveTimes = incidents
    .map((i) => i.resolution_time_minutes)
    .filter((t) => t != null && t > 0);
  const avgResolve = resolveTimes.length
    ? resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length
    : null;

  // Most affected service
  const serviceCounts = {};
  incidents.forEach((inc) => {
    const svc = inc.service || "unknown";
    serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
  });
  const mostAffected = Object.entries(serviceCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    total_incidents: total,
    memory_count: total,
    avg_time_to_resolve_mins: avgResolve,
    most_affected_service: mostAffected ? mostAffected[0] : null,
  };
}

// Resolve = create a new incident (legacy resolve modal)
export async function resolveIncident(payload) {
  return _createIncident({
    title: payload.alert_text || payload.incident_id || "Untitled",
    service: payload.service_name || "unknown",
    severity: payload.severity || "MEDIUM",
    root_cause: payload.actual_root_cause || "",
    resolution: (payload.actual_resolution_steps || []).join("\n"),
    resolution_time_minutes: payload.time_to_resolve_mins || null,
  });
}

// Normalize incidents from the new backend shape to what the UI expects
function normalizeIncident(raw) {
  return {
    id: raw.id,
    display_id: raw.title?.startsWith("INC-") ? raw.title.split(":")[0]?.trim() : ("INC-" + (raw.id ? raw.id.slice(0, 4).toUpperCase() : "0000")),
    incident_id: raw.title?.startsWith("INC-") ? raw.title.split(":")[0]?.trim() : null,
    service_name: raw.service || "unknown",
    severity: raw.severity || "MEDIUM",
    root_cause: raw.root_cause || "",
    resolution: raw.resolution || "",
    alert_text: raw.title || "",
    time_to_resolve_mins: raw.resolution_time_minutes,
    timestamp: raw.created_at,
    tags: [],
  };
}

export { normalizeIncident };
