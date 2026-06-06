import {
  AlertTriangle,
  FileCode,
  Search,
  Brain,
  Database,
  Zap,
  FileCheck,
  ArrowRight,
  Clock,
  RefreshCw,
  BookOpen,
} from "lucide-react";

const pipelineSteps = [
  {
    icon: AlertTriangle,
    title: "Alert Event",
    desc: "Ingestion of high-severity alerts from monitoring...",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: FileCode,
    title: "Embedding Gen",
    desc: "Convert alert context into dense vector...",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Search,
    title: "Memory Search",
    desc: "Query Operational Memory Store for semantic...",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Database,
    title: "Top Incidents",
    desc: "Retrieve closest from historically resolved or...",
    color: "text-on-surface-variant",
    bg: "bg-on-surface-variant/10",
  },
  {
    icon: Brain,
    title: "AI Reasoning",
    desc: "LLM synthesizes root cause hypothesis from...",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: FileCheck,
    title: "Resolution Plan",
    desc: "Structured action plan with runbook links...",
    color: "text-on-surface-variant",
    bg: "bg-on-surface-variant/10",
  },
];

const techStack = [
  {
    label: "Frontend",
    tech: "React + Tailwind",
    desc: "High-performance UI rendering.",
  },
  {
    label: "Backend",
    tech: "FastAPI",
    desc: "High-throughput async API layer.",
  },
  {
    label: "Memory Layer",
    tech: "Hindsight",
    desc: "Semantic vector embeddings engine.",
  },
  {
    label: "LLM Core",
    tech: "Groq",
    desc: "Ultra-low latency inference processing.",
  },
  {
    label: "Incident Repository",
    tech: "Operational Memory Store",
    desc: "Persistent storage for validated root causes and remediation scripts.",
  },
];

const principles = [
  {
    num: "01",
    title: "Resolution as Memory",
    desc: "Every resolved incident automatically becomes searchable vector memory.",
    color: "text-primary",
  },
  {
    num: "02",
    title: "Compounding Intelligence",
    desc: "Historical incident data directly improves the accuracy of future automated diagnosis.",
    color: "text-info",
  },
  {
    num: "03",
    title: "Retrieval-First",
    desc: "Memory retrieval strictly precedes any LLM generation to verified operational reality.",
    color: "text-warning",
  },
  {
    num: "04",
    title: "Data Isolation",
    desc: "All memory stores operate in isolated private spaces to guarantee security and compliance.",
    color: "text-error",
  },
];

export default function Architecture() {
  return (
    <div className="flex flex-col gap-stack-large">
      <div className="flex items-center gap-4 text-on-surface-variant font-mono text-label-caps uppercase">
        <span>Systems</span>
        <span>Production</span>
        <span className="text-primary">Memory</span>
      </div>

      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          System Architecture
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
          How AEGIS transforms incidents into organizational memory.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded p-6">
        <h2 className="font-mono text-label-caps text-on-surface uppercase mb-6">
          Workflow Pipeline
        </h2>
        <div className="flex items-start gap-2 overflow-x-auto pb-4">
          {pipelineSteps.map((step, idx) => (
            <div key={step.title} className="flex items-start gap-2">
              <div className="flex flex-col items-center min-w-[140px]">
                <div
                  className={`w-12 h-12 rounded-lg ${step.bg} flex items-center justify-center mb-3`}
                >
                  <step.icon size={24} className={step.color} />
                </div>
                <div className="text-body-base text-on-surface font-bold text-center font-inter">
                  {step.title}
                </div>
                <div className="text-[11px] text-on-surface-variant text-center mt-1 font-inter max-w-[130px]">
                  {step.desc}
                </div>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <div className="flex items-center pt-5 shrink-0">
                  <ArrowRight
                    size={16}
                    className="text-on-surface-variant"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 font-mono text-[11px] text-on-surface-variant flex items-center justify-center gap-2">
          <RefreshCw size={12} className="text-primary" />
          Memory Update Loop
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        <div className="lg:col-span-3">
          <div className="bg-surface-container border border-outline-variant rounded p-6">
            <h2 className="font-mono text-label-caps text-on-surface uppercase mb-4">
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {techStack.map((item) => (
                <div
                  key={item.label}
                  className="bg-background border border-outline-variant rounded p-4"
                >
                  <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-1">
                    {item.label}
                  </div>
                  <div className="text-primary font-mono text-data-mono font-bold">
                    {item.tech}
                  </div>
                  <div className="text-body-sm text-on-surface-variant mt-1 font-inter">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface-container border border-outline-variant rounded p-6">
            <h2 className="font-mono text-label-caps text-on-surface uppercase mb-4">
              Core Principles
            </h2>
            <div className="flex flex-col gap-4">
              {principles.map((p) => (
                <div key={p.num} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${p.color}`}
                  >
                    {p.num}
                  </div>
                  <div>
                    <div className="text-body-base text-on-surface font-bold font-inter">
                      {p.title}
                    </div>
                    <div className="text-body-sm text-on-surface-variant font-inter mt-0.5">
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container border border-outline-variant rounded p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-primary" />
            <h3 className="font-mono text-label-caps text-on-surface uppercase">
              Reduced MTTR
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant font-inter">
            Accelerate resolution times by instantly surfacing historical context
            and pre-validated runbooks during critical outages.
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={18} className="text-primary" />
            <h3 className="font-mono text-label-caps text-on-surface uppercase">
              Avoid Repetitions
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant font-inter">
            Prevent the same incident from occurring twice by surfacing these
            into automated, retrievable organizational memory.
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant rounded p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-primary" />
            <h3 className="font-mono text-label-caps text-on-surface uppercase">
              Capture Knowledge
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant font-inter">
            Digitize undocumented "tribal knowledge" from engineers, making it
            accessible to the entire operations team.
          </p>
        </div>
      </div>
    </div>
  );
}
