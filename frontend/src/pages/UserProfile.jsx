import {
  Shield,
  Activity,
  Brain,
  BookOpen,
  TrendingDown,
  Eye,
  Database,
  Terminal,
  FileSearch,
  ChevronRight,
} from "lucide-react";

const recentActivity = [
  {
    icon: Eye,
    text: "Viewed Incident",
    id: "INC-8492",
    detail: "Database connection pool exhaustion in us-east-1.",
    time: "10m ago",
    color: "text-primary",
  },
  {
    icon: Database,
    text: "Added Incident Memory for",
    id: "INC-8480",
    detail: "Documented root cause regarding Redis cache eviction policy misconfiguration.",
    time: "2h ago",
    color: "text-primary",
  },
  {
    icon: Terminal,
    text: "Executed Runbook",
    id: "RB-221",
    detail: "Automated pod restart sequence for stuck payment processing workers.",
    time: "Yesterday",
    color: "text-primary",
  },
  {
    icon: Activity,
    text: "Updated Incident Resolution for",
    id: "INC-8475",
    detail: "",
    time: "Yesterday",
    color: "text-primary",
  },
  {
    icon: FileSearch,
    text: "Reviewed Root Cause Analysis for",
    id: "INC-8450",
    detail: "",
    time: "Oct 24",
    color: "text-primary",
  },
];

export default function UserProfile() {
  return (
    <div className="flex flex-col gap-stack-large">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          User Profile
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1 font-inter">
          Account activity and operational contribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="flex flex-col gap-stack-large">
          <div className="bg-surface-container border border-outline-variant rounded p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center mb-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface-container-high flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">AM</span>
              </div>
            </div>
            <h2 className="text-headline-md text-on-surface font-bold">
              Alex Mercer
            </h2>
            <p className="text-body-sm text-on-surface-variant font-inter">
              Senior Reliability Engineer
            </p>
            <p className="text-body-sm text-primary font-mono mt-1">
              alex.mercer@aegis-ops.com
            </p>

            <div className="w-full mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">Team</span>
                <span className="text-on-surface font-inter">
                  Core Infrastructure
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  Organization
                </span>
                <span className="text-on-surface font-inter">
                  Engineering Operations
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  Timezone
                </span>
                <span className="text-on-surface font-inter">
                  UTC-8 (Pacific Time)
                </span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors font-inter text-body-base">
              Edit Profile
            </button>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded p-6">
            <h3 className="font-mono text-label-caps text-on-surface uppercase mb-4">
              Security & Access
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  Last Login
                </span>
                <span className="text-on-surface font-inter">
                  Today, 08:42 UTC
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  Active Sessions
                </span>
                <span className="text-on-surface font-inter">2 Devices</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  MFA Status
                </span>
                <span className="px-2 py-0.5 bg-primary/15 border border-primary rounded text-primary font-mono text-[10px] uppercase">
                  Enforced
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-inter">
                  API Access Status
                </span>
                <span className="px-2 py-0.5 bg-primary/15 border border-primary rounded text-primary font-mono text-[10px] uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-stack-large">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Incidents Diagnosed
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                482
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Historical Matches
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                1,204
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Memories Added
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                89
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Runbooks Executed
                </span>
              </div>
              <div className="text-headline-lg text-on-surface font-bold">
                315
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface-variant uppercase">
                  Avg Resolution Impact
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-headline-lg text-primary font-bold">
                  -42%
                </span>
                <span className="text-on-surface-variant text-body-sm font-inter">
                  MTTR reduction vs team average
                </span>
                <span className="px-2 py-0.5 bg-primary/15 border border-primary rounded text-primary font-mono text-[10px] uppercase ml-auto">
                  Top 10%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded flex flex-col">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-mono text-label-caps text-on-surface uppercase">
                Recent Activity
              </h2>
              <button className="text-primary text-body-sm font-inter hover:underline">
                View Full Log
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-[1px] before:bg-outline-variant last:before:hidden"
                >
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 z-10">
                    <item.icon size={14} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <div className="text-body-sm text-on-surface font-inter">
                      {item.text}{" "}
                      <span className="text-primary font-mono">
                        {item.id}
                      </span>
                    </div>
                    {item.detail && (
                      <div className="text-body-sm text-on-surface-variant font-inter mt-0.5">
                        {item.detail}
                      </div>
                    )}
                  </div>
                  <span className="text-on-surface-variant font-mono text-[10px] whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
