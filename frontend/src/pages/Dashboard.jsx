import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStats, getIncidents, normalizeIncident } from "../api/client";
import { useToast } from "../App";
import SeverityBadge from "../components/ui/SeverityBadge";
import StatusBadge from "../components/ui/StatusBadge";
import {
  TrendingUp,
  TrendingDown,
  Database,
  AlertTriangle,
  Cpu,
  Search,
  Terminal,
} from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col gap-2">
      <div className="h-3 w-24 skeleton" />
      <div className="h-7 w-16 skeleton mt-1" />
      <div className="h-3 w-32 skeleton mt-1" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-outline-variant">
      <td className="px-4 py-3"><div className="h-4 w-20 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 skeleton" /></td>
    </tr>
  );
}

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const healthItems = [
  { name: "Memory Retrieval", status: "OPERATIONAL" },
  { name: "Semantic Search", status: "OPERATIONAL" },
  { name: "Diagnosis Engine", status: "OPERATIONAL" },
  { name: "Knowledge Ingestion", status: "DEGRADED" },
];

const activityIcons = [Cpu, Search, Terminal, AlertTriangle];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addToast = useToast();

  const fetchData = async () => {
    try {
      const [statsData, incidentsResult] = await Promise.all([
        getStats(),
        getIncidents(),
      ]);
      setStats(statsData);
      const normalized = (incidentsResult.incidents || []).map(normalizeIncident);
      setIncidents(normalized);
      setLoading(false);
    } catch (err) {
      addToast(err.message, "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const recentIncidents = incidents?.slice(0, 3) || [];
  const activityIncidents = incidents?.slice(0, 4) || [];

  function toActivityEntry(incident, index) {
    const id = incident.incident_id || ("INC-" + (incident.id ? incident.id.slice(0,4).toUpperCase() : "0000"));
    const svc = incident.service_name || "platform-core";
    const templates = [
      { icon: "brain", text: `Root cause identified for ${id}`, sub: `${svc} — ${incident.root_cause?.slice(0,60)}...` },
      { icon: "search", text: `Historical match retrieved`, sub: `Pattern aligned with ${id} in ${svc}` },
      { icon: "terminal", text: `Runbook auto-suggested for ${id}`, sub: `Resolution applied to ${svc}` },
      { icon: "alert", text: `Anomaly detected in ${svc}`, sub: `Severity: ${incident.severity} — ${id}` },
    ];
    return { ...templates[index % templates.length], time: incident.timestamp };
  }

  const activityEntries = activityIncidents.map((inc, idx) => toActivityEntry(inc, idx));

  return (
    <div className="flex flex-col gap-stack-large">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                Total Incidents
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                {stats?.total_incidents ?? 0}
              </div>
              <div className="text-body-sm text-error mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> +2 vs last week
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                Memory Count
              </div>
              <div className="text-headline-lg text-primary font-bold">
                {stats?.memory_count ?? 0}
              </div>
              <div className="text-body-sm text-on-surface-variant mt-2 flex items-center gap-1">
                <Database size={14} /> Active entries
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                Avg Resolution Time
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                {stats?.avg_time_to_resolve_mins
                  ? `${Math.round(stats.avg_time_to_resolve_mins)}m`
                  : "—"}
              </div>
              <div className="text-body-sm text-primary mt-2 flex items-center gap-1">
                <TrendingDown size={14} /> -5m vs avg
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                Most Affected Service
              </div>
              <div className="font-mono text-data-mono text-error font-bold break-all">
                {stats?.most_affected_service || "—"}
              </div>
              <div className="text-body-sm text-on-surface-variant mt-2 flex items-center gap-1">
                <AlertTriangle size={14} /> 8 recent alerts
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 flex flex-col gap-stack-large">
          <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-mono text-label-caps text-on-surface uppercase">
                Operational Health
              </h2>
              <button className="text-primary text-body-sm hover:underline">
                View details
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {healthItems.map((item) => (
                <div
                  key={item.name}
                  className="border border-outline-variant rounded p-3 flex items-center justify-between bg-background"
                >
                  <span className="text-body-base text-on-surface font-inter">
                    {item.name}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h2 className="font-mono text-label-caps text-on-surface uppercase">
                Recent Incidents
              </h2>
              <button
                className="text-primary text-body-sm hover:underline"
                onClick={() => navigate("/memory")}
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-background">
                    <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                      Incident ID
                    </th>
                    <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                      Service
                    </th>
                    <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                      Severity
                    </th>
                    <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                      Resolution Time
                    </th>
                    <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-data-mono">
                  {loading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : recentIncidents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-on-surface-variant text-body-sm"
                      >
                        No incidents recorded yet
                      </td>
                    </tr>
                  ) : (
                    recentIncidents.map((inc) => (
                      <tr
                        key={inc.id}
                        className="border-b border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer"
                        onClick={() =>
                          navigate("/diagnose", {
                            state: { alertText: inc.alert_text },
                          })
                        }
                      >
                        <td className="px-4 py-3 text-primary group-hover:underline">
                          {inc.display_id}
                        </td>
                        <td className="px-4 py-3 text-on-surface">
                          {inc.service_name}
                        </td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {inc.time_to_resolve_mins
                            ? `${inc.time_to_resolve_mins}m`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {inc.timestamp
                            ? new Date(inc.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <h2 className="font-mono text-label-caps text-on-surface uppercase">
              Activity Feed
            </h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full skeleton shrink-0" />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="h-3 w-full skeleton" />
                      <div className="h-2 w-16 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              activityEntries.map((entry, idx) => {
                const Icon =
                  entry.icon === "brain"
                    ? Cpu
                    : entry.icon === "search"
                    ? Search
                    : entry.icon === "terminal"
                    ? Terminal
                    : AlertTriangle;
                const isError = entry.icon === "alert";
                return (
                  <div
                    key={idx}
                    className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-[1px] before:bg-outline-variant last:before:hidden"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isError
                          ? "bg-error/20 border border-error/50"
                          : "bg-surface-container-high border border-outline-variant"
                      }`}
                    >
                      <Icon
                        size={14}
                        className={isError ? "text-error" : "text-primary"}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-body-sm text-on-surface font-inter font-medium">
                        {entry.text}
                      </div>
                      <div className="text-[12px] text-on-surface-variant font-inter">
                        {entry.sub}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant mt-1">
                        {relativeTime(entry.time)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {!loading && activityIncidents.length === 0 && (
              <div className="text-on-surface-variant text-body-sm text-center py-8">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
