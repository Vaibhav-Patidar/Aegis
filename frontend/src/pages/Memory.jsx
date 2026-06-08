import { useState, useEffect, useCallback } from "react";
import { getIncidents, getStats, resolveIncident, getHealth, normalizeIncident } from "../api/client";
import { useToast } from "../App";
import SeverityBadge from "../components/ui/SeverityBadge";
import {
  Search,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

function SkeletonRow() {
  return (
    <tr className="border-b border-outline-variant">
      <td className="px-4 py-3"><div className="h-4 w-20 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 skeleton" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 skeleton" /></td>
    </tr>
  );
}

export default function Memory() {
  const [incidents, setIncidents] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(null);
  const addToast = useToast();

  const [commitForm, setCommitForm] = useState({
    incident_id: "",
    alert_text: "",
    service_name: "",
    actual_root_cause: "",
    actual_resolution_steps: [""],
    severity: "MEDIUM",
    time_to_resolve_mins: 15,
    post_mortem_summary: "",
    tags: "",
  });

  const fetchData = async () => {
    try {
      const [incResult, st] = await Promise.all([getIncidents(), getStats()]);
      const normalized = (incResult.incidents || []).map(normalizeIncident);
      setIncidents(normalized);
      setStats(st);
      setLoading(false);
    } catch (err) {
      addToast(err.message, "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("memory-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = incidents?.filter((inc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.id?.toLowerCase().includes(q) ||
      inc.display_id?.toLowerCase().includes(q) ||
      inc.service_name?.toLowerCase().includes(q) ||
      inc.root_cause?.toLowerCase().includes(q) ||
      inc.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const highlightIncidentIds = (text) => text;

  const handleCommit = async () => {
    setResolveLoading(true);
    try {
      const payload = {
        ...commitForm,
        tags: commitForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        actual_resolution_steps: commitForm.actual_resolution_steps.filter((s) => s.trim()),
      };
      const data = await resolveIncident(payload);
      setResolveSuccess(data);
      fetchData();
      addToast("Knowledge committed successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setResolveLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-stack-large">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-mono text-label-caps uppercase mb-1">
            AEGIS / <span className="text-primary">Memory</span>
          </div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Intelligence Repository
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
            Index, search, and recall past operational incidents to accelerate future resolutions.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-primary text-background font-inter text-body-base font-semibold rounded hover:bg-accent-dim transition-colors flex items-center gap-2"
          onClick={() => setShowCommitModal(true)}
        >
          <Plus size={16} /> Commit Knowledge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Total Memories
          </div>
          <div className="text-headline-lg text-primary font-bold">
            {loading ? <div className="h-7 w-12 skeleton" /> : stats?.memory_count ?? 0}
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Avg Resolution Time
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-on-surface font-bold">
              {loading ? <div className="h-7 w-12 skeleton" /> : stats?.avg_time_to_resolve_mins ? `${Math.round(stats.avg_time_to_resolve_mins)}` : "—"}
            </span>
            <span className="text-on-surface-variant text-body-sm">m</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
            Memory Growth (30D)
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-primary" />
            <span className="text-headline-lg text-primary font-bold">+12%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          id="memory-search"
          className="w-full bg-surface-container border border-outline-variant rounded pl-10 pr-4 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant"
          placeholder="Search incidents, services, tags... (Press '/' to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            onClick={() => setSearch("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-background">
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Incident ID</th>
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Service Name</th>
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Severity</th>
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Root Cause</th>
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Resolution Time</th>
                <th className="px-4 py-3 font-mono text-label-caps text-on-surface-variant uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="font-mono text-data-mono">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-body-sm">
                    {search ? "No incidents match your search" : "No incidents recorded yet"}
                  </td>
                </tr>
              ) : (
                filtered?.map((inc) => (
                  <tr key={inc.id} className="border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer group" onClick={() => setSelectedIncident(inc)}>
                    <td className="px-4 py-3 text-primary group-hover:underline">{inc.display_id}</td>
                    <td className="px-4 py-3 text-on-surface">{inc.service_name}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                    <td className="px-4 py-3 text-on-surface-variant truncate max-w-[300px]" title={inc.root_cause}>{inc.root_cause}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{inc.time_to_resolve_mins ? `${inc.time_to_resolve_mins}m` : "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{formatTimestamp(inc.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCommitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center sticky top-0 bg-surface-container z-10">
              <h2 className="text-headline-md text-on-surface font-bold">
                {resolveSuccess ? "Knowledge Committed" : "Commit Knowledge"}
              </h2>
              <button onClick={() => { setShowCommitModal(false); setResolveSuccess(null); }} className="text-on-surface-variant hover:text-on-surface"><X size={20} /></button>
            </div>
            {resolveSuccess ? (
              <div className="p-6 flex flex-col items-center gap-4">
                <CheckCircle size={48} className="text-primary" />
                <p className="text-on-surface-variant text-body-base text-center">{resolveSuccess.memory_count} incidents now indexed</p>
                <button className="px-6 py-2 bg-primary text-background font-semibold rounded hover:bg-accent-dim transition-colors" onClick={() => { setShowCommitModal(false); setResolveSuccess(null); }}>Done</button>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Incident ID</label>
                  <input className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={commitForm.incident_id} onChange={(e) => setCommitForm((f) => ({ ...f, incident_id: e.target.value }))} placeholder="INC-XXXX" />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Alert Text</label>
                  <textarea className="w-full h-16 bg-background border border-outline-variant rounded p-3 font-mono text-data-mono text-on-surface resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={commitForm.alert_text} onChange={(e) => setCommitForm((f) => ({ ...f, alert_text: e.target.value }))} />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Service Name</label>
                  <input className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={commitForm.service_name} onChange={(e) => setCommitForm((f) => ({ ...f, service_name: e.target.value }))} />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Root Cause</label>
                  <textarea className="w-full h-16 bg-background border border-outline-variant rounded p-3 font-mono text-data-mono text-on-surface resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={commitForm.actual_root_cause} onChange={(e) => setCommitForm((f) => ({ ...f, actual_root_cause: e.target.value }))} />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Resolution Steps</label>
                  {commitForm.actual_resolution_steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input className="flex-1 bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={step} onChange={(e) => { const s = [...commitForm.actual_resolution_steps]; s[idx] = e.target.value; setCommitForm((f) => ({ ...f, actual_resolution_steps: s })); }} placeholder={`Step ${idx + 1}`} />
                      {commitForm.actual_resolution_steps.length > 1 && <button className="text-error" onClick={() => setCommitForm((f) => ({ ...f, actual_resolution_steps: f.actual_resolution_steps.filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>}
                    </div>
                  ))}
                  <button className="flex items-center gap-1 text-primary text-body-sm hover:underline" onClick={() => setCommitForm((f) => ({ ...f, actual_resolution_steps: [...f.actual_resolution_steps, ""] }))}><Plus size={14} /> Add Step</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Severity</label>
                    <select className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none" value={commitForm.severity} onChange={(e) => setCommitForm((f) => ({ ...f, severity: e.target.value }))}><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select>
                  </div>
                  <div>
                    <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Time to Resolve (mins)</label>
                    <input type="number" className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none" value={commitForm.time_to_resolve_mins} onChange={(e) => setCommitForm((f) => ({ ...f, time_to_resolve_mins: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Post-Mortem Summary</label>
                  <textarea className="w-full h-16 bg-background border border-outline-variant rounded p-3 font-mono text-data-mono text-on-surface resize-none focus:border-primary outline-none" value={commitForm.post_mortem_summary} onChange={(e) => setCommitForm((f) => ({ ...f, post_mortem_summary: e.target.value }))} />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">Tags (comma-separated)</label>
                  <input className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary outline-none" value={commitForm.tags} onChange={(e) => setCommitForm((f) => ({ ...f, tags: e.target.value }))} placeholder="database, timeout" />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors" onClick={() => setShowCommitModal(false)}>Cancel</button>
                  <button className="px-6 py-2 bg-primary text-background font-semibold rounded hover:bg-accent-dim transition-colors flex items-center gap-2 disabled:opacity-50" onClick={handleCommit} disabled={resolveLoading}>{resolveLoading && <Loader2 size={16} className="animate-spin" />}Commit to Memory</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
