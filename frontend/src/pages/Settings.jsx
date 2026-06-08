import { useState } from "react";
import { useToast } from "../App";
import {
  Building2,
  Brain,
  Cpu,
  ChevronRight,
  Save,
} from "lucide-react";

export default function Settings() {
  const addToast = useToast();

  const loadSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("aegis_settings") || "{}");
      return saved;
    } catch {
      return {};
    }
  };

  const defaults = loadSettings();
  const [orgName, setOrgName] = useState(defaults.orgName || "Acme Corp Infrastructure");
  const [region, setRegion] = useState(defaults.region || "us-east-1");
  const [dataIsolation, setDataIsolation] = useState(defaults.dataIsolation ?? true);
  const [similarityThreshold, setSimilarityThreshold] = useState(defaults.similarityThreshold ?? 0.85);
  const [retrievalDepth, setRetrievalDepth] = useState(defaults.retrievalDepth || "deep");
  const [maxMatches, setMaxMatches] = useState(defaults.maxMatches ?? 15);
  const [retentionWindow, setRetentionWindow] = useState(defaults.retentionWindow || "90");
  const [continuousLearning, setContinuousLearning] = useState(defaults.continuousLearning ?? true);

  const handleSave = () => {
    const settings = {
      orgName,
      region,
      dataIsolation,
      similarityThreshold,
      retrievalDepth,
      maxMatches,
      retentionWindow,
      continuousLearning,
    };
    localStorage.setItem("aegis_settings", JSON.stringify(settings));
    addToast("Settings saved", "success");
  };

  return (
    <div className="flex flex-col gap-stack-large max-w-3xl">
      <div className="flex items-center gap-2 text-on-surface-variant font-mono text-label-caps uppercase">
        <span>AEGIS</span>
        <ChevronRight size={12} />
        <span className="text-primary">Settings</span>
      </div>

      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          Platform Settings
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
          Configure organizational memory, AI behavior, and workspace preferences.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
          <Building2 size={18} className="text-primary" />
          <h2 className="text-headline-md text-on-surface font-bold">
            Organization Settings
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Organization Name
            </label>
            <input
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Workspace Region
            </label>
            <select
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="us-west-2">us-west-2 (Oregon)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-2">
              Storage Allocation (12TB / 50TB)
            </label>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-base text-on-surface font-inter">
              Data Isolation
            </span>
            <button
              className={`w-12 h-6 rounded-full transition-colors relative ${
                dataIsolation ? "bg-primary" : "bg-outline-variant"
              }`}
              onClick={() => setDataIsolation(!dataIsolation)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  dataIsolation ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
          <Brain size={18} className="text-primary" />
          <h2 className="text-headline-md text-on-surface font-bold">
            Organizational Memory
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-label-caps text-on-surface-variant uppercase">
                Similarity Threshold: {similarityThreshold.toFixed(2)}
              </label>
              <span className="text-primary font-mono text-data-mono">
                {similarityThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={similarityThreshold}
              onChange={(e) =>
                setSimilarityThreshold(parseFloat(e.target.value))
              }
              className="w-full h-1 bg-outline-variant rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Memory Retrieval Depth
            </label>
            <select
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
              value={retrievalDepth}
              onChange={(e) => setRetrievalDepth(e.target.value)}
            >
              <option value="shallow">Shallow - Quick Lookup</option>
              <option value="standard">Standard - Balanced</option>
              <option value="deep">Deep - Comprehensive Context</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Max Historical Matches
            </label>
            <input
              type="number"
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
              value={maxMatches}
              onChange={(e) => setMaxMatches(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Knowledge Retention Window
            </label>
            <select
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
              value={retentionWindow}
              onChange={(e) => setRetentionWindow(e.target.value)}
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">1 Year</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-base text-on-surface font-inter">
                Continuous Learning Mode
              </span>
              {continuousLearning && (
                <span className="px-2 py-0.5 bg-primary/15 border border-primary rounded text-primary font-mono text-[10px] uppercase">
                  Active
                </span>
              )}
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors relative ${
                continuousLearning ? "bg-primary" : "bg-outline-variant"
              }`}
              onClick={() => setContinuousLearning(!continuousLearning)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  continuousLearning ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
          <Cpu size={18} className="text-primary" />
          <h2 className="text-headline-md text-on-surface font-bold">
            AI Diagnosis Engine
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              LLM Provider
            </label>
            <select className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none">
              <option>Groq — Llama 3.3 70B</option>
              <option>OpenAI — GPT-4o</option>
              <option>Anthropic — Claude 3.5</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-label-caps text-on-surface-variant uppercase block mb-1.5">
              Temperature
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              defaultValue="0.3"
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 font-mono text-data-mono text-on-surface focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      <button
        className="px-6 py-2.5 bg-primary text-background font-inter text-body-base font-semibold rounded hover:bg-accent-dim transition-colors self-start flex items-center gap-2"
        onClick={handleSave}
      >
        <Save size={16} />
        Save Changes
      </button>
    </div>
  );
}
