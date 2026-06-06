import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  diagnoseIncident,
  resolveIncident,
  getHealth,
} from "../api/client";
import { useToast } from "../App";
import MatchScore from "../components/ui/MatchScore";
import {
  Loader2,
  CheckCircle,
  ChevronRight,
  X,
  Plus,
  Trash2,
} from "lucide-react";

export default function Diagnose() {
  const location = useLocation();
  const addToast = useToast();
  const [alertText, setAlertText] = useState(
    location.state?.alertText || ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(null);

  const [resolveForm, setResolveForm] = useState({
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

  const fetchHealth = async () => {
    try {
      const data = await getHealth();
      setHealthData(data);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (location.state?.alertText) {
      setAlertText(location.state.alertText);
    }
  }, [location.state]);

  const handleAnalyze = async () => {
    if (!alertText.trim()) return;
    setLoading(true);
    setResult(null);
    setCheckedSteps({});
    try {
      const data = await diagnoseIncident(alertText);
      setResult(data);
      setResolveForm((prev) => ({
        ...prev,
        alert_text: alertText,
        actual_root_cause: data.root_cause,
        actual_resolution_steps: data.resolution_steps || [""],
        severity: data.suggested_severity || "MEDIUM",
      }));
      const recent = JSON.parse(localStorage.getItem("aegis_recent_diagnoses") || "[]");
      recent.unshift(data);
      if (recent.length > 10) recent.pop();
      localStorage.setItem("aegis_recent_diagnoses", JSON.stringify(recent));
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setResolveLoading(true);
    try {
      const payload = {
        ...resolveForm,
        tags: resolveForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        actual_resolution_steps: resolveForm.actual_resolution_steps.filter(
          (s) => s.trim()
        ),
      };
      const data = await resolveIncident(payload);
      setResolveSuccess(data);
      fetchHealth();
      addToast("Incident resolved successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setResolveLoading(false);
    }
  };

  const highlightIncidentIds = (text) => text;

  const stepTimeEstimate = (idx, total) => {
    if (!result?.mttr_estimate_mins || !total) return "—";
    const perStep = Math.round(result.mttr_estimate_mins / total);
    return `${perStep}m`;
  };

  const extractCommand = (text) => {
    const match = text.match(/`([^`]+)`/);
    return match ? match[1] : null;
  };

  const topMatches = result?.similar_incidents?.slice(0, 3) || [];

  return (
    <div className="flex flex-col gap-stack-large">
      <div className="flex items-center gap-2 text-on-surface-variant font-mono text-label-caps uppercase">
        <span className="text-on-surface-variant">AEGIS</span>
        <ChevronRight size={12} />
        <span className="text-primary">Diagnose</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-body-sm text-on-surface-variant font-mono uppercase mb-1">
            {result?.suggested_service ? (
              <>Affected: {result.suggested_service} | Severity: {result.suggested_severity}</>
            ) : (
              <>ORG: ACME CORP &bull; PRIVATE ORGANIZATIONAL MEMORY</>
            )}
          </div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Diagnose Incident
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded">
          <span className="text-primary font-mono text-[11px] uppercase tracking-wider">
            Querying Organizational Memory ({healthData?.memory_count ?? "..."}{" "}
            Historical Incidents Available)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 flex flex-col gap-stack-large">
          <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                Incident Input / Trace Logs
              </span>
              <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                Auto-Detect Format: JSON/Text
              </span>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-40 bg-background border border-outline-variant rounded p-4 font-mono text-data-mono text-on-surface resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant"
                placeholder="Paste stack trace, log lines, or describe the anomaly here..."
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="font-mono text-[11px] text-on-surface-variant">
                  {alertText.length > 0
                    ? `${alertText.split("\n").length} L | ${alertText.length} C`
                    : ""}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Engine: AEGIS-CORE-v2.1
                  </span>
                  <button
                    className="px-4 py-2 bg-primary text-background font-inter text-body-base font-semibold rounded hover:bg-accent-dim transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAnalyze}
                    disabled={loading || !alertText.trim()}
                  >
                    {loading && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Analyze Incident
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-surface-container border border-outline-variant rounded p-8 flex flex-col items-center gap-4">
              <Loader2
                size={32}
                className="animate-spin text-primary"
              />
              <div className="text-on-surface-variant text-body-base font-inter">
                Analyzing incident against organizational memory...
              </div>
              <div className="w-48 h-1 bg-outline-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
                <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h2 className="font-mono text-label-caps text-on-surface uppercase">
                    Likely Root Cause
                  </h2>
                </div>
                <div className="p-4">
                  <p className="text-body-base text-on-surface font-inter leading-relaxed">
                    {result.root_cause}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
                <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h2 className="font-mono text-label-caps text-on-surface uppercase">
                    Resolution Plan
                  </h2>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {result.resolution_steps?.map((step, idx) => {
                    const command = extractCommand(step);
                    const cleanStep = step.replace(/`[^`]+`/g, "").trim();
                    return (
                      <div
                        key={idx}
                        className="flex gap-3 items-start"
                      >
                        <button
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            checkedSteps[idx]
                              ? "bg-primary border-primary"
                              : "border-outline-variant hover:border-primary"
                          }`}
                          onClick={() =>
                            setCheckedSteps((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                        >
                          {checkedSteps[idx] && (
                            <CheckCircle
                              size={12}
                              className="text-background"
                            />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-mono text-[11px]">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={`text-body-base font-inter ${
                                  checkedSteps[idx]
                                    ? "text-on-surface-variant line-through"
                                    : "text-on-surface"
                                }`}
                              >
                                {cleanStep || step}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-on-surface-variant">
                              EST.{" "}
                              {stepTimeEstimate(
                                idx,
                                result.resolution_steps.length
                              )}
                            </span>
                          </div>
                          {command && (
                            <div className="mt-2 bg-background border border-outline-variant rounded p-2 font-mono text-[12px] text-primary">
                              $ {command}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="px-6 py-2.5 bg-primary/10 border border-primary text-primary font-inter text-body-base font-semibold rounded hover:bg-primary/20 transition-colors self-start"
                onClick={() => setShowResolveModal(true)}
              >
                Mark Resolved
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-stack-large">
          <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-mono text-label-caps text-on-surface uppercase">
                Historical Matches
              </h2>
              <span className="font-mono text-[11px] text-on-surface-variant">
                Top 3
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {topMatches.length > 0 ? (
                topMatches.map((match) => {
                  const displayId = match.incident_id || ("INC-" + (match.id ? match.id.slice(0, 4).toUpperCase() : "0000"));
                  const serviceName = match.service_name || "platform-core";
                  const shortRC = (match.root_cause || "").slice(0, 55) + ((match.root_cause || "").length > 55 ? "..." : "");
                  
                  return (
                    <div key={match.id} className="bg-background border border-outline-variant rounded p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-mono text-data-mono">{displayId}</span>
                        <span className="text-on-surface-variant font-mono text-[11px] uppercase">{serviceName}</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant font-inter leading-relaxed">{shortRC}</p>
                      <div className="mt-2 pt-2 border-t border-outline-variant">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase">Match Score</span>
                          <span className="text-[10px] font-mono text-primary">{Math.round((match.match_score || 0) * 100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.round((match.match_score || 0) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-on-surface-variant text-body-sm text-center py-6 font-inter">
                  {loading
                    ? "Searching memory..."
                    : result
                    ? "No historical matches found"
                    : "Submit an incident to find matches"}
                </div>
              )}
              {result?.similar_incidents?.length > 3 && (
                <button className="text-primary text-body-sm font-inter hover:underline text-center">
                  View All {result.similar_incidents.length} Matches
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center sticky top-0 bg-surface-container z-10">
              <h2 className="text-headline-md text-on-surface font-bold">
                {resolveSuccess ? "Resolution Saved" : "Resolve Incident"}
              </h2>
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveSuccess(null);
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {resolveSuccess ? (
              <div className="p-6 flex flex-col items-center gap-4">
                <CheckCircle size={48} className="text-primary" />
                <h3 className="text-headline-md text-on-surface font-bold">
                  Memory Updated
                </h3>
                <p className="text-on-surface-variant text-body-base text-center font-inter">
                  {resolveSuccess.memory_count} incidents now indexed in
                  organizational memory
                </p>
                <p className="font-mono text-data-mono text-primary">
                  ID: {resolveSuccess.hindsight_id}
                </p>
                <button
                  className="px-6 py-2 bg-primary text-background font-inter font-semibold rounded hover:bg-accent-dim transition-colors"
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolveSuccess(null);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Incident ID
                  </label>
                  <input
                    className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={resolveForm.incident_id}
                    onChange={(e) =>
                      setResolveForm((f) => ({
                        ...f,
                        incident_id: e.target.value,
                      }))
                    }
                    placeholder="INC-XXXX"
                  />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Service Name
                  </label>
                  <input
                    className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={resolveForm.service_name}
                    onChange={(e) =>
                      setResolveForm((f) => ({
                        ...f,
                        service_name: e.target.value,
                      }))
                    }
                    placeholder="e.g. checkout-api"
                  />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Actual Root Cause
                  </label>
                  <textarea
                    className="w-full h-20 bg-background border border-outline-variant rounded p-3 font-mono text-data-mono text-on-surface resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={resolveForm.actual_root_cause}
                    onChange={(e) =>
                      setResolveForm((f) => ({
                        ...f,
                        actual_root_cause: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Resolution Steps
                  </label>
                  {resolveForm.actual_resolution_steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="flex-1 bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [
                            ...resolveForm.actual_resolution_steps,
                          ];
                          newSteps[idx] = e.target.value;
                          setResolveForm((f) => ({
                            ...f,
                            actual_resolution_steps: newSteps,
                          }));
                        }}
                        placeholder={`Step ${idx + 1}`}
                      />
                      {resolveForm.actual_resolution_steps.length > 1 && (
                        <button
                          className="text-error hover:text-error/80 transition-colors"
                          onClick={() => {
                            const newSteps =
                              resolveForm.actual_resolution_steps.filter(
                                (_, i) => i !== idx
                              );
                            setResolveForm((f) => ({
                              ...f,
                              actual_resolution_steps: newSteps,
                            }));
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-1 text-primary text-body-sm hover:underline"
                    onClick={() =>
                      setResolveForm((f) => ({
                        ...f,
                        actual_resolution_steps: [
                          ...f.actual_resolution_steps,
                          "",
                        ],
                      }))
                    }
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                      Severity
                    </label>
                    <select
                      className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={resolveForm.severity}
                      onChange={(e) =>
                        setResolveForm((f) => ({
                          ...f,
                          severity: e.target.value,
                        }))
                      }
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                      Time to Resolve (mins)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={resolveForm.time_to_resolve_mins}
                      onChange={(e) =>
                        setResolveForm((f) => ({
                          ...f,
                          time_to_resolve_mins: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Post-Mortem Summary
                  </label>
                  <textarea
                    className="w-full h-20 bg-background border border-outline-variant rounded p-3 font-mono text-data-mono text-on-surface resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={resolveForm.post_mortem_summary}
                    onChange={(e) =>
                      setResolveForm((f) => ({
                        ...f,
                        post_mortem_summary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    className="w-full bg-background border border-outline-variant rounded px-3 py-2 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={resolveForm.tags}
                    onChange={(e) =>
                      setResolveForm((f) => ({
                        ...f,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="database, timeout, connection-pool"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors font-inter"
                    onClick={() => setShowResolveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-primary text-background font-inter font-semibold rounded hover:bg-accent-dim transition-colors flex items-center gap-2 disabled:opacity-50"
                    onClick={handleResolve}
                    disabled={resolveLoading}
                  >
                    {resolveLoading && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Resolve & Save to Memory
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
