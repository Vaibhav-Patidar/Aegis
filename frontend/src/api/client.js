export const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function diagnoseIncident(alertText) {
  return request("/incident", {
    method: "POST",
    body: JSON.stringify({ alert_text: alertText }),
  });
}

export function resolveIncident(payload) {
  return request("/resolve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function extractServiceFromAlert(alertText) {
  const known_services = [
    "auth-service", "payments-api", "payments-gateway", "product-catalog",
    "inventory-db", "notification-worker", "api-gateway", "search-service",
    "recommendation-engine", "session-store", "order-service", "checkout-api",
    "user-profile-db", "cdn-router", "search-indexer"
  ];
  if (!alertText) return "platform-core";
  const lower = alertText.toLowerCase();
  for (const svc of known_services) {
    if (lower.includes(svc)) return svc;
  }
  for (const svc of known_services) {
    const core = svc.split("-")[0];
    if (lower.includes(core)) return svc;
  }
  return "platform-core";
}

export function normalizeIncident(raw) {
  return {
    ...raw,
    service_name: (!raw.service_name || raw.service_name === "unknown")
      ? extractServiceFromAlert(raw.alert_text)
      : raw.service_name,
    display_id: raw.incident_id || ("INC-" + (raw.id ? raw.id.slice(0, 4).toUpperCase() : "0000")),
  };
}

export async function getIncidents() {
  const data = await request("/incidents");
  return data.map(normalizeIncident);
}

export function getStats() {
  return request("/stats");
}

export function getHealth() {
  return request("/health");
}
