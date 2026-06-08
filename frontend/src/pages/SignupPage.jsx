import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signupAPI } from "../lib/api";
import { useToast } from "../App";
import { Loader2, ArrowRight, Eye, EyeOff, AlertTriangle, Shield } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Sign up with Supabase Auth
      await signup(email, password);
      // 2. Register org on the backend
      try {
        await signupAPI(email, password, orgName);
      } catch (_) {
        // Backend signup may fail if org already exists — still continue
      }
      addToast("Workspace created! Check your email to verify.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex selection:bg-primary selection:text-on-primary">
      {/* Left Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Brand */}
          <div className="flex items-center justify-center mb-8 gap-2">
            <span className="text-headline-lg font-inter font-bold text-on-surface tracking-tighter">
              AEGIS
            </span>
            <div className="w-2 h-2 rounded-full bg-primary mt-1" />
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-headline-lg font-inter font-semibold mb-2 text-on-surface">
              Create your workspace
            </h1>
            <p className="text-body-base font-inter text-on-surface-variant">
              Start building your team's incident memory. Free forever.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-error/10 border border-error/30 rounded flex items-center gap-2">
              <AlertTriangle size={16} className="text-error shrink-0" />
              <span className="text-body-sm text-error">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="signup-fullName"
                className="block font-mono text-label-caps text-on-surface-variant uppercase"
              >
                Full Name
              </label>
              <input
                id="signup-fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-surface-container-low border border-outline-variant rounded font-mono text-data-mono text-on-surface placeholder:text-on-surface-variant/50 px-4 py-3 transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block font-mono text-label-caps text-on-surface-variant uppercase"
              >
                Work Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@acme.com"
                className="w-full bg-surface-container-low border border-outline-variant rounded font-mono text-data-mono text-on-surface placeholder:text-on-surface-variant/50 px-4 py-3 transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="signup-orgName"
                className="block font-mono text-label-caps text-on-surface-variant uppercase"
              >
                Organization Name
              </label>
              <input
                id="signup-orgName"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Engineering"
                className="w-full bg-surface-container-low border border-outline-variant rounded font-mono text-data-mono text-on-surface placeholder:text-on-surface-variant/50 px-4 py-3 transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="signup-password"
                className="block font-mono text-label-caps text-on-surface-variant uppercase"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant rounded font-mono text-data-mono text-on-surface placeholder:text-on-surface-variant/50 px-4 py-3 pr-10 transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-inter text-body-base font-semibold py-3 px-4 rounded hover:bg-primary-fixed transition-colors flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <Link
              to="/login"
              className="text-body-base font-inter text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Already have an account? Sign in
              <ArrowRight size={14} />
            </Link>
            <p className="text-body-sm font-inter text-on-surface-variant/60">
              By signing up you agree to our{" "}
              <a href="#" className="underline hover:text-on-surface">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-on-surface">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Context Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-surface-container border-l border-outline-variant relative overflow-hidden flex-col">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #263241 1px, transparent 1px), linear-gradient(to bottom, #263241 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-12">
          {/* Mini Diagnosis UI */}
          <div className="w-full max-w-[500px] bg-surface-container-low border border-outline-variant rounded shadow-2xl mb-12">
            <div className="border-b border-outline-variant px-4 py-2 flex items-center gap-2 bg-surface-container-high rounded-t">
              <Shield size={14} className="text-primary" />
              <span className="font-mono text-label-caps text-on-surface uppercase">
                Aegis Intelligence
              </span>
            </div>
            <div className="p-4 space-y-4 font-mono text-data-mono text-on-surface-variant">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-error mt-0.5 shrink-0" />
                <div>
                  <div className="text-error mb-1">
                    Incoming Alert: DB Connection Pool Exhaustion
                  </div>
                  <div className="text-on-surface-variant/70 text-[11px]">
                    Stack trace matched with 94% confidence to INC-8821.
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/50">
                <span className="text-primary">&gt;</span> Analyzing historical resolution paths...
                <br />
                <span className="text-primary">&gt;</span> Found matching root cause from 6 months ago.
                <br />
                <span className="text-primary">&gt;</span> Recommended Action: Restart pgbouncer instances in us-east-1 and scale pool size to 400.
              </div>
            </div>
          </div>

          {/* Stats & Quote */}
          <div className="w-full max-w-[500px] space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-outline-variant rounded p-4 bg-surface-container/50">
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                  Average MTTR reduction
                </div>
                <div className="text-headline-lg font-inter font-semibold text-primary">34%</div>
              </div>
              <div className="border border-outline-variant rounded p-4 bg-surface-container/50">
                <div className="font-mono text-label-caps text-on-surface-variant uppercase mb-2">
                  Incidents stored
                </div>
                <div className="text-headline-lg font-inter font-semibold text-primary">50,000+</div>
              </div>
            </div>

            <div className="border border-outline-variant rounded p-6 bg-surface-container-highest relative">
              <div className="text-on-surface-variant/30 text-4xl absolute top-3 left-4 font-serif">"</div>
              <blockquote className="relative z-10">
                <p className="text-body-base font-inter text-on-surface mb-4 leading-relaxed">
                  "We resolved a P0 in 4 minutes because Aegis found the exact same failure from 6 months ago."
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary font-mono text-data-mono">
                    SA
                  </div>
                  <div>
                    <div className="font-mono text-data-mono text-on-surface">Staff SRE</div>
                    <div className="text-body-sm font-inter text-on-surface-variant">Series C Fintech</div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
