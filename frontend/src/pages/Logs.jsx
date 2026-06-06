import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

const services = [
  "checkout-api",
  "payment-gateway",
  "auth-service",
  "inventory-db",
  "recommendation-engine",
  "api-gateway",
];

const levels = ["ERROR", "WARN", "INFO"];
const levelWeights = [0.05, 0.15, 0.8];

const messagesByLevel = {
  ERROR: [
    "Database connection timeout exceeded 30s threshold",
    "Failed to process payment transaction — upstream 503",
    "Out of memory: container killed by OOM handler",
    "SSL certificate validation failed for downstream service",
    "Connection pool exhausted — max connections reached",
    "Unhandled promise rejection in request handler",
  ],
  WARN: [
    "Retry threshold exceeded, backing off exponentially",
    "Token refresh completed with elevated latency (2.4s)",
    "Replication lag detected: 450ms behind primary",
    "Cache miss rate exceeds 40% threshold",
    "Request queue depth approaching limit: 847/1000",
    "Deprecated API version v1 called by client",
  ],
  INFO: [
    "Database connection established successfully",
    "Cache refreshed — 1,247 entries loaded",
    "Elevated latency observed: p99 = 340ms",
    "Health check passed — all dependencies healthy",
    "Deployment v2.4.1 rolled out to 3/3 instances",
    "Background job completed: index_rebuild (12.4s)",
    "Rate limiter reset for client auth-proxy",
    "Metrics exported: 2,401 data points",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickLevel() {
  const r = Math.random();
  if (r < levelWeights[0]) return levels[0];
  if (r < levelWeights[0] + levelWeights[1]) return levels[1];
  return levels[2];
}

function generateLog() {
  const level = pickLevel();
  return {
    id: Math.random().toString(36).substring(2, 10),
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    service: pickRandom(services),
    level,
    message: pickRandom(messagesByLevel[level]),
    env: "prod",
  };
}

const levelBadgeClasses = {
  ERROR: "bg-error/15 border-error text-error",
  WARN: "bg-warning/15 border-warning text-warning",
  INFO: "bg-on-surface-variant/15 border-on-surface-variant text-on-surface-variant",
};

export default function Logs() {
  const [logs, setLogs] = useState(() =>
    Array.from({ length: 8 }, generateLog)
  );
  const [isLive, setIsLive] = useState(true);
  const [totalCount, setTotalCount] = useState(142891);
  const [serviceFilter, setServiceFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const tableRef = useRef(null);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [generateLog(), ...prev];
        return newLogs.slice(0, 50);
      });
      setTotalCount((c) => c + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = logs.filter((log) => {
    if (serviceFilter !== "All" && log.service !== serviceFilter) return false;
    if (levelFilter !== "All" && log.level !== levelFilter) return false;
    return true;
  });

  const levelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    { ERROR: 0, WARN: 0, INFO: 0 }
  );

  const serviceCounts = logs.reduce((acc, log) => {
    acc[log.service] = (acc[log.service] || 0) + 1;
    return acc;
  }, {});

  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-stack-large">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          Live System Logs
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
          Real-time application and infrastructure telemetry.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input
            className="w-full bg-surface-container border border-outline-variant rounded pl-3 pr-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none placeholder:text-on-surface-variant"
            placeholder="Search Logs (e.g. error AND service)"
          />
        </div>
        <select
          className="bg-surface-container border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="All">Service: All</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="bg-surface-container border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="All">Level: All</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select className="bg-surface-container border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none">
          <option>Env: Prod</option>
          <option>Env: Staging</option>
          <option>Env: Dev</option>
        </select>
        <select className="bg-surface-container border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none">
          <option>Last 15 minutes</option>
          <option>Last 1 hour</option>
          <option>Last 6 hours</option>
          <option>Last 24 hours</option>
        </select>
        <button
          className={`px-4 py-2 rounded font-mono text-data-mono font-bold flex items-center gap-2 transition-colors ${
            isLive
              ? "bg-primary/15 border border-primary text-primary"
              : "bg-surface-container border border-outline-variant text-on-surface-variant"
          }`}
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? <Pause size={14} /> : <Play size={14} />}
          {isLive ? "LIVE" : "PAUSED"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto" ref={tableRef}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-outline-variant bg-background">
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Timestamp
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Service
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Level
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Message
                  </th>
                  <th className="px-4 py-2 font-mono text-label-caps text-on-surface-variant uppercase">
                    Env
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-data-mono">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-outline-variant hover:bg-surface-container transition-colors animate-fade-in"
                  >
                    <td className="px-4 py-2 text-on-surface-variant whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-2 text-primary whitespace-nowrap">
                      {log.service}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-[2px] border text-[10px] uppercase ${levelBadgeClasses[log.level]}`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-surface max-w-[300px] truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-2 text-on-surface-variant">
                      {log.env}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-stack-large">
          <div className="bg-surface-container border border-outline-variant rounded p-4">
            <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
              Total Logs / 15M
            </div>
            <div className="text-headline-lg text-on-surface font-bold">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-body-sm text-primary mt-1 flex items-center gap-1">
              +12% vs prev
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded p-4">
            <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">
              Level Breakdown
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-error font-mono text-data-mono">
                  ERROR
                </span>
                <span className="text-on-surface font-mono text-data-mono">
                  {levelCounts.ERROR}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-warning font-mono text-data-mono">
                  WARN
                </span>
                <span className="text-on-surface font-mono text-data-mono">
                  {levelCounts.WARN}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-mono text-data-mono">
                  INFO
                </span>
                <span className="text-on-surface font-mono text-data-mono">
                  {levelCounts.INFO}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded p-4">
            <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">
              Most Active Services
            </div>
            <div className="flex flex-col gap-2">
              {topServices.map(([service, count]) => (
                <div
                  key={service}
                  className="flex justify-between items-center"
                >
                  <span className="text-on-surface font-mono text-data-mono">
                    {service}
                  </span>
                  <span className="text-on-surface-variant font-mono text-data-mono">
                    {Math.round((count / logs.length) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded p-4">
            <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">
              Top Error Signature
            </div>
            <div className="bg-error/10 border border-error/30 rounded p-3">
              <div className="font-mono text-[12px] text-error leading-relaxed">
                Database connection timeout in checkout-api
              </div>
            </div>
            <div className="text-on-surface-variant text-body-sm mt-2 font-inter">
              Occurred 412 times
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
