import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { getIncidents } from "../api/client";

const runbooks = [
  {
    id: "RB-221",
    name: "PostgreSQL Replication Recovery",
    service: "inventory-db",
    incidents: 12,
    avgTime: "14 min",
    updated: "3 days ago",
    status: "ACTIVE",
    summary: "Procedures for restoring and increasing replication between primary and standby nodes in the inventory-db cluster after a network partition or failover event.",
    metadata: { owner: "DBA Team", created: "2024-01-15", lastRun: "3 days ago" },
    services: ["inventory-db", "pg-bouncer"],
    steps: [
      "1. Verify primary health: `pg_is_in_recovery()`",
      "2. Check WAL receiver status on standby.",
      "3. If stalled, execute `pg_rewind` or resync from base backup.",
      "4. Restart postgresql service on standby.",
    ],
    linkedIncidents: [
      { id: "INC-9921", date: "Oct 11" },
      { id: "INC-8834", date: "Sep 28" },
      { id: "INC-8711", date: "Sep 15" },
    ],
  },
  {
    id: "RB-118",
    name: "Redis Cluster Failover",
    service: "session-store",
    incidents: 8,
    avgTime: "7 min",
    updated: "1 week ago",
    status: "ACTIVE",
    summary: "Automated failover procedure for Redis cluster nodes handling session data. Includes sentinel promotion and client reconnection verification.",
    metadata: { owner: "Platform Team", created: "2024-02-20", lastRun: "1 week ago" },
    services: ["session-store", "redis-sentinel"],
    steps: [
      "1. Check Redis Sentinel status: `redis-cli -p 26379 sentinel masters`",
      "2. Force failover if needed: `SENTINEL FAILOVER mymaster`",
      "3. Verify new master promotion and replica sync.",
      "4. Update client configuration if topology changed.",
    ],
    linkedIncidents: [
      { id: "INC-9105", date: "Oct 5" },
      { id: "INC-8622", date: "Sep 12" },
    ],
  },
  {
    id: "RB-403",
    name: "Payment Gateway Recovery",
    service: "payments-api",
    incidents: 15,
    avgTime: "11 min",
    updated: "Yesterday",
    status: "ACTIVE",
    summary: "Recovery procedure for payment gateway service outages including circuit breaker reset, connection pool drain, and transaction queue replay.",
    metadata: { owner: "Payments Team", created: "2024-03-10", lastRun: "Yesterday" },
    services: ["payments-api", "stripe-proxy"],
    steps: [
      "1. Check circuit breaker state: `GET /internal/circuit-breaker/status`",
      "2. Drain stale connections: `POST /internal/pool/drain`",
      "3. Reset circuit breaker: `POST /internal/circuit-breaker/reset`",
      "4. Replay failed transactions from dead letter queue.",
    ],
    linkedIncidents: [
      { id: "INC-9842", date: "Oct 15" },
      { id: "INC-9501", date: "Oct 2" },
      { id: "INC-9210", date: "Sep 22" },
    ],
  },
];

export default function Runbooks() {
  const [selectedId, setSelectedId] = useState(runbooks[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    getIncidents().then(setIncidents).catch(console.error);
  }, []);

  const dynamicRunbooks = runbooks.map(rb => {
    const linked = incidents.filter(inc => inc.service_name === rb.service).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return {
      ...rb,
      incidents: linked.length,
      linkedIncidents: linked.slice(0, 5).map(inc => ({
        id: inc.display_id,
        date: new Date(inc.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    };
  });

  const selected = dynamicRunbooks.find(rb => rb.id === selectedId);

  const filtered = dynamicRunbooks.filter(
    (rb) =>
      rb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rb.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rb.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLinked = dynamicRunbooks.reduce((sum, rb) => sum + rb.incidents, 0);

  return (
    <div className="flex flex-col gap-stack-large">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Runbook Intelligence
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
            Standardized recovery procedures connected to historical incident
            knowledge.
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-background font-inter text-body-base font-semibold rounded hover:bg-accent-dim transition-colors">
          + Create Runbook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Total Runbooks
          </div>
          <div className="text-headline-lg text-primary font-bold">24</div>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Linked Incidents
          </div>
          <div className="text-headline-lg text-on-surface font-bold">{totalLinked}</div>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Avg Recovery Time
          </div>
          <div className="text-headline-lg text-on-surface font-bold">
            14 min
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Success Rate
          </div>
          <div className="text-headline-lg text-primary font-bold">92%</div>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          className="w-full bg-surface-container border border-outline-variant rounded pl-10 pr-4 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant"
          placeholder="Search runbooks, services, recovery procedures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        <div className="lg:col-span-3 bg-surface-container border border-outline-variant rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-background">
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Runbook ID
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Runbook Name
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Service
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Incidents
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Avg Time
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Updated
                </th>
                <th className="px-4 py-2.5 font-mono text-label-caps text-on-surface-variant uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-data-mono">
              {filtered.map((rb) => (
                <tr
                  key={rb.id}
                  className={`border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${
                    selected?.id === rb.id ? "bg-surface-container-high" : ""
                  }`}
                  onClick={() => setSelectedId(rb.id)}
                >
                  <td className="px-4 py-3 text-primary">{rb.id}</td>
                  <td className="px-4 py-3 text-on-surface">{rb.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {rb.service}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {rb.incidents}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {rb.avgTime}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {rb.updated}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-[2px] bg-primary/15 border border-primary text-primary text-[10px] uppercase">
                      {rb.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-1">
                Selected Procedure
              </div>
              <div className="text-primary font-mono text-data-mono">
                {selected.id}
              </div>
              <div className="text-headline-md text-on-surface font-bold mt-1">
                {selected.name}
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-1">
                  Summary
                </div>
                <p className="text-body-sm text-on-surface-variant font-inter">
                  {selected.summary}
                </p>
              </div>
              <div>
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-1">
                  Metadata
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-sm">
                  <div>
                    <span className="text-on-surface-variant">Owner: </span>
                    <span className="text-on-surface">
                      {selected.metadata.owner}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Data Eng: </span>
                    <span className="text-on-surface">
                      {selected.avgTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Services: </span>
                    <span className="text-on-surface font-mono text-[11px]">
                      {selected.services.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                  Recovery Steps
                </div>
                <div className="bg-background border border-outline-variant rounded p-3 font-mono text-[12px] text-on-surface leading-relaxed whitespace-pre-wrap">
                  {selected.steps.join("\n")}
                </div>
              </div>
              <div>
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                  Linked Incidents (Recent)
                </div>
                <div className="flex flex-col gap-1">
                  {selected.linkedIncidents.map((li) => (
                    <div
                      key={li.id}
                      className="flex justify-between items-center text-body-sm"
                    >
                      <span className="text-primary font-mono">{li.id}</span>
                      <span className="text-on-surface-variant">
                        {li.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-2 px-4 py-2 bg-primary/10 border border-primary text-primary font-inter text-body-base font-semibold rounded hover:bg-primary/20 transition-colors self-end">
                Execute Runbook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
