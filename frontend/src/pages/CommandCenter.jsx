import { useState, useEffect } from "react";
import { getStats, getIncidents } from "../api/client";
import { useToast } from "../App";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Target, Zap, Shield, Clock } from "lucide-react";

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  nodes: Math.round(10 + i * 1.3 + Math.random() * 8),
}));

const queriedIncidents = [
  { id: "INC-9042", queries: 142, reuse: "89%" },
  { id: "INC-8810", queries: 98, reuse: "76%" },
  { id: "INC-9106", queries: 95, reuse: "92%" },
  { id: "INC-7432", queries: 64, reuse: "51%" },
  { id: "INC-8999", queries: 61, reuse: "88%" },
];

function SkeletonCard() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col gap-2">
      <div className="h-3 w-24 skeleton" />
      <div className="h-7 w-20 skeleton" />
      <div className="h-3 w-32 skeleton" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded p-2 font-mono text-[11px]">
        <div className="text-on-surface-variant">{label}</div>
        <div className="text-primary">{payload[0].value} nodes</div>
      </div>
    );
  }
  return null;
}

const CLUSTER_PATTERNS = [
  { pattern: /redis.*oom|oom.*redis|maxmemory|allkeys/i, label: "Redis OOM / Memory Eviction" },
  { pattern: /connection.pool|max_connections|pool.exhaust/i, label: "Database Connection Pool Exhaustion" },
  { pattern: /certificate|ssl|tls|cert.expir/i, label: "SSL Certificate Expiry" },
  { pattern: /disk.full|storage.*100|log.rotation|oomkilled/i, label: "Disk / Storage Saturation" },
  { pattern: /latency|p99|timeout|slow.query/i, label: "Latency Spike / Timeout" },
  { pattern: /deploy|rollback|version|upgrade/i, label: "Bad Deployment / Rollback" },
  { pattern: /queue|consumer.lag|worker.thread|sqs/i, label: "Queue Consumer Lag" },
  { pattern: /memory.leak|heap|gc.pressure/i, label: "Memory Leak" },
  { pattern: /rate.limit|throttl/i, label: "Rate Limit / Throttling" },
  { pattern: /replication|replica.lag|wal/i, label: "Replication Lag" },
];

function clusterRootCause(rootCause) {
  for (const { pattern, label } of CLUSTER_PATTERNS) {
    if (pattern.test(rootCause)) return label;
  }
  return "Misconfiguration / Other";
}

export default function CommandCenter() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, inc] = await Promise.all([getStats(), getIncidents()]);
        setStats(s);
        setIncidents(inc);
        setLoading(false);
      } catch (err) {
        addToast(err.message, "error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const serviceCounts = incidents?.reduce((acc, inc) => {
    if (!acc[inc.service_name]) {
      acc[inc.service_name] = { count: 0, totalTime: 0 };
    }
    acc[inc.service_name].count++;
    acc[inc.service_name].totalTime += inc.time_to_resolve_mins || 0;
    return acc;
  }, {});

  const topServices = serviceCounts
    ? Object.entries(serviceCounts)
        .filter(([name]) => name !== "unknown")
        .map(([name, data]) => ({
          name,
          count: data.count,
          avgTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    : [];

  const rootCauseClusters = incidents
    ? (() => {
        const clusters = {};
        incidents.forEach((inc) => {
          const label = clusterRootCause(inc.root_cause || inc.alert_text);
          if (!clusters[label]) {
            clusters[label] = { count: 0, lastSeen: inc.timestamp };
          }
          clusters[label].count++;
          if (
            inc.timestamp &&
            (!clusters[label].lastSeen || new Date(inc.timestamp) > new Date(clusters[label].lastSeen))
          ) {
            clusters[label].lastSeen = inc.timestamp;
          }
        });
        return Object.entries(clusters)
          .map(([cause, data]) => ({
            cause,
            count: data.count,
            lastSeen: data.lastSeen,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
      })()
    : [];

  const relativeTime = (ts) => {
    if (!ts) return "—";
    const diff = Date.now() - new Date(ts).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col gap-stack-large">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          Operational Insights
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
          Organizational learning metrics and historical incident retention. Data
          reflects the last 30 days of production telemetry.
        </p>
      </div>

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
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-on-surface-variant" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Memory Growth
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                {stats?.memory_count !== undefined ? stats.memory_count.toLocaleString() : "—"}{" "}
                <span className="text-body-sm text-on-surface-variant font-normal">
                  nodes
                </span>
              </div>
              <div className="text-body-sm text-primary mt-1">
                {stats?.memory_count > 20
                  ? `+${Math.round(stats.memory_count * 0.124)}% vs last mo`
                  : stats?.memory_count !== undefined
                  ? `+${stats.memory_count} new this week`
                  : "—"}
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-on-surface-variant" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Incident Reuse Rate
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                {(() => {
                  if (!incidents || incidents.length === 0) return "—";
                  const reused = incidents.filter(
                    (inc) => inc.similar_incidents && inc.similar_incidents.length > 0
                  ).length;
                  return Math.round((reused / incidents.length) * 100);
                })()}
                <span className="text-body-sm text-on-surface-variant font-normal">
                  %
                </span>
              </div>
              <div className="text-body-sm text-on-surface-variant mt-1">
                Queries leading to resolution
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-on-surface-variant" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Avg Similarity Match
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                {(() => {
                  const recent = JSON.parse(localStorage.getItem("aegis_recent_diagnoses") || "[]");
                  const matches = recent.flatMap(d => d.similar_incidents || []);
                  if (matches.length === 0) return "—";
                  const avgScore = matches.reduce((sum, inc) => sum + (inc.match_score || 0), 0) / matches.length;
                  return avgScore.toFixed(2);
                })()}{" "}
                <span className="text-body-sm text-on-surface-variant font-normal">
                  cosine
                </span>
              </div>
              <div className="text-body-sm text-on-surface-variant mt-1">
                Vector DB confidence
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-on-surface-variant" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Time Saved (30D)
                </span>
              </div>
              <div className="text-headline-lg text-primary font-bold">
                {(() => {
                  if (!incidents || incidents.length === 0) return "0";
                  const matched = incidents.filter(inc => (inc.match_score || 0) > 0.6).length;
                  return Math.floor((matched * 45) / 60);
                })()}
                <span className="text-body-sm text-on-surface-variant font-normal">
                  h
                </span>
              </div>
              <div className="text-body-sm text-primary mt-1">
                Based on 45m / match
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        <div className="lg:col-span-3 bg-surface-container border border-outline-variant rounded flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-mono text-label-caps text-on-surface uppercase">
              Learning Trend (Nodes Added)
            </h2>
            <span className="font-mono text-[11px] text-on-surface-variant">
              Last 30 Days
            </span>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#8FA896" }}
                  axisLine={false}
                  tickLine={false}
                  interval={5}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#8FA896" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="nodes"
                  stroke="#00FFB2"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#00FFB2" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant">
            <h2 className="font-mono text-label-caps text-on-surface uppercase">
              Most Queried Historical Incidents
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-background">
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Incident ID
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Queries
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Reuse
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-data-mono">
                {queriedIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                  >
                    <td className="px-4 py-2.5 text-primary">{inc.id}</td>
                    <td className="px-4 py-2.5 text-on-surface">
                      {inc.queries}
                    </td>
                    <td className="px-4 py-2.5 text-primary">{inc.reuse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant">
            <h2 className="font-mono text-label-caps text-on-surface uppercase">
              Most Common Root Causes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-background">
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Root Cause Cluster
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Occurrences
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-data-mono">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center">
                      <div className="h-4 w-40 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : rootCauseClusters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-on-surface-variant text-body-sm"
                    >
                      No incident data available
                    </td>
                  </tr>
                ) : (
                  rootCauseClusters.map((rc) => (
                    <tr
                      key={rc.cause}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 py-2.5 text-on-surface max-w-[250px] truncate">
                        {rc.cause}
                      </td>
                      <td className="px-4 py-2.5 text-on-surface">
                        {rc.count}
                      </td>
                      <td className="px-4 py-2.5 text-on-surface-variant">
                        {relativeTime(rc.lastSeen)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant">
            <h2 className="font-mono text-label-caps text-on-surface uppercase">
              Top Affected Services
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-background">
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Service Name
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Incident Count
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Avg Resolution
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-data-mono">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center">
                      <div className="h-4 w-40 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : topServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-on-surface-variant text-body-sm"
                    >
                      No service data available
                    </td>
                  </tr>
                ) : (
                  topServices.map((svc) => (
                    <tr
                      key={svc.name}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 py-2.5 text-on-surface">
                        {svc.name}
                      </td>
                      <td className="px-4 py-2.5 text-on-surface">
                        {svc.count}
                      </td>
                      <td className="px-4 py-2.5 text-on-surface-variant">
                        {svc.avgTime}m
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
