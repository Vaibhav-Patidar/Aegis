import { Link } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Search,
  Brain,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Database,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary selection:text-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-outline-variant bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <span className="font-inter text-headline-lg font-bold text-on-surface tracking-tighter">
              AEGIS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-label-caps text-on-surface-variant uppercase">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-mono text-label-caps text-on-surface-variant uppercase hover:text-on-surface transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary text-on-primary font-mono text-label-caps uppercase rounded hover:bg-primary-fixed transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-inter font-bold leading-[1.1] tracking-tight text-on-surface mb-6">
            Your team has solved this before.
          </h1>
          <p className="text-body-base font-inter text-on-surface-variant leading-relaxed max-w-lg mb-10 text-[16px]">
            Aegis gives engineering teams a permanent memory for incidents — so you stop debugging the same failures at 2am.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="group px-6 py-3 bg-primary text-on-primary font-mono text-label-caps uppercase rounded hover:bg-primary-fixed transition-colors flex items-center gap-2"
            >
              Start for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-outline-variant text-on-surface font-mono text-label-caps uppercase rounded hover:bg-surface-container transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Diagnostics Mockup */}
        <div className="bg-surface-container border border-outline-variant rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border-b border-outline-variant">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            </div>
            <span className="font-mono text-label-caps text-on-surface-variant uppercase ml-2">
              Aegis AI Diagnostics
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
            <div className="p-4">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">
                Input Stack Trace
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 font-mono text-data-mono text-on-surface-variant leading-relaxed">
                <span className="text-primary">&gt;</span> Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
                <br />
                <span className="text-on-surface-variant/60 pl-4">at java.util.Arrays.copyOf(Arrays.java:3332)</span>
                <br />
                <span className="text-on-surface-variant/60 pl-4">at java.lang.AbstractStringBuilder.ensureCapacityInternal(AbstractStringBuilder.java:124)</span>
                <br />
                <span className="text-on-surface-variant/60 pl-4">at com.example.processor.DataAggregator.processLargeBatch(DataAggregator.java:89)</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-label-caps text-primary uppercase">
                  Historical Match — 94% Similarity
                </span>
              </div>
              <div className="space-y-3 font-mono text-data-mono">
                <div>
                  <span className="text-primary">INC-8821:</span>{" "}
                  <span className="text-on-surface">OOM during nightly data aggregation.</span>
                </div>
                <div>
                  <div className="text-on-surface-variant text-body-sm font-bold mb-1">Root Cause:</div>
                  <div className="text-on-surface-variant">
                    Batch size configuration `aggregator.batch_size` exceeded heap limits when processing multi-tenant data.
                  </div>
                </div>
                <div>
                  <div className="text-on-surface-variant text-body-sm font-bold mb-1">Resolution:</div>
                  <div className="text-on-surface-variant">
                    1. Decrease `aggregator.batch_size` to 500 in config.yml
                    <br />
                    2. Restart pod.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-outline-variant py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono text-label-caps text-primary uppercase tracking-widest text-center mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            {[
              { icon: AlertTriangle, step: "1", title: "Alert Fires", desc: "PagerDuty triggers with stack trace." },
              { icon: Search, step: "2", title: "Aegis Searches", desc: "Scans millions of historical logs & tickets." },
              { icon: Database, step: "3", title: "Match Found", desc: "Identifies identical past incident." },
              { icon: CheckCircle, step: "4", title: "Resolve Faster", desc: "Engineer applies proven fix instantly." },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-body-base font-inter font-semibold text-on-surface mb-1">
                  {item.step}. {item.title}
                </h3>
                <p className="text-body-sm font-inter text-on-surface-variant">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-outline-variant py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "Incident Memory",
              desc: "Every resolved incident becomes a searchable vector. Your org gets smarter with every outage, preventing repeated research.",
            },
            {
              icon: Search,
              title: "AI Diagnosis",
              desc: "Paste a stack trace. Get the 3 most similar historical incidents and an AI-generated synthesis of what likely went wrong.",
            },
            {
              icon: TrendingUp,
              title: "Compounding Intel",
              desc: "The more incidents your team resolves, the faster the next one gets fixed. Memory compounds, reducing MTTR over time.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded border border-outline-variant bg-surface-container-high flex items-center justify-center">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="text-headline-md font-inter font-semibold text-on-surface">
                {f.title}
              </h3>
              <p className="text-body-base font-inter text-on-surface-variant leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-outline-variant py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-inter font-bold text-on-surface mb-2">
              Pricing for Every Stage
            </h2>
            <p className="text-body-base font-inter text-on-surface-variant">
              Transparent pricing designed for engineering teams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">Free</div>
              <div className="text-4xl font-inter font-bold text-on-surface mb-6">$0</div>
              <div className="flex-1 space-y-3 mb-8">
                {["1 User", "50 Incidents stored", "Community Support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-body-base font-inter text-on-surface-variant">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="w-full py-3 border border-outline-variant rounded text-center font-mono text-label-caps text-on-surface-variant uppercase">
                Current Plan
              </div>
            </div>
            {/* Team */}
            <div className="bg-surface-container border-2 border-primary rounded-lg p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-on-primary font-mono text-label-caps uppercase rounded-full text-[10px]">
                Most Popular
              </div>
              <div className="font-mono text-label-caps text-primary uppercase mb-3">Team</div>
              <div className="text-4xl font-inter font-bold text-on-surface mb-1">
                $199<span className="text-lg text-on-surface-variant font-normal">/mo</span>
              </div>
              <div className="flex-1 space-y-3 mt-6 mb-8">
                {["25 Users", "Unlimited Incidents", "Priority Support", "Slack Integration"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-body-base font-inter text-on-surface-variant">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to="/signup"
                className="w-full py-3 bg-primary text-on-primary rounded text-center font-mono text-label-caps uppercase hover:bg-primary-fixed transition-colors"
              >
                Start Trial
              </Link>
            </div>
            {/* Enterprise */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col">
              <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-3">Enterprise</div>
              <div className="text-4xl font-inter font-bold text-on-surface mb-1">
                $800+<span className="text-lg text-on-surface-variant font-normal">/mo</span>
              </div>
              <div className="flex-1 space-y-3 mt-6 mb-8">
                {["Unlimited Users", "Unlimited Incidents", "SSO (SAML)", "SOC 2 Compliance"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-body-base font-inter text-on-surface-variant">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="w-full py-3 border border-outline-variant rounded text-center font-mono text-label-caps text-on-surface-variant uppercase hover:bg-surface-container-high transition-colors cursor-pointer">
                Contact Sales
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="font-inter text-body-sm text-on-surface-variant">
              AEGIS
            </span>
            <span className="text-body-sm text-on-surface-variant">
              Organizational memory for engineering teams
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-label-caps text-on-surface-variant uppercase">
            <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
            <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
            <a href="#" className="hover:text-on-surface transition-colors">Docs</a>
            <a href="#" className="hover:text-on-surface transition-colors">Status</a>
          </div>
          <span className="font-mono text-body-sm text-on-surface-variant">
            © 2024 AEGIS. Built for SREs, by engineers.
          </span>
        </div>
      </footer>
    </div>
  );
}
