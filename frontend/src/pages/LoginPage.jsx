import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../App";
import { Loader2, ArrowRight, Eye, EyeOff, AlertTriangle, Shield, ArrowDown } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      addToast("Welcome back!", "success");
      navigate("/");
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-on-surface flex font-inter antialiased selection:bg-primary selection:text-black">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-[rgba(17,22,29,0.7)] backdrop-blur-xl border border-[rgba(38,50,65,0.5)] p-10 rounded-xl relative overflow-hidden">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Shield size={28} className="text-primary" />
              <h1 className="font-inter text-headline-lg font-semibold tracking-tighter text-white" style={{ textShadow: "0 0 8px rgba(68, 227, 211, 0.4)" }}>
                AEGIS
              </h1>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-1" />
            </div>
            <h2 className="font-inter text-headline-md font-semibold text-white">Welcome back</h2>
            <p className="text-[#859491] text-body-sm">Your team's memory is waiting.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-error/10 border border-error/30 rounded flex items-center gap-2">
              <AlertTriangle size={16} className="text-error shrink-0" />
              <span className="text-body-sm text-error">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="login-email" className="block font-mono text-label-caps text-on-surface-variant uppercase">
                Work Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline-variant">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acme.com"
                  className="block w-full pl-10 py-2.5 rounded-md bg-[#0d0d14] border border-[#2a2a3e] text-on-surface font-mono text-data-mono transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block font-mono text-label-caps text-on-surface-variant uppercase">
                  Password
                </label>
                <a href="#" className="text-body-sm text-primary hover:text-primary-fixed transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline-variant">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-md bg-[#0d0d14] border border-[#2a2a3e] text-on-surface font-mono text-data-mono transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant/50"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-md bg-primary text-on-primary font-inter text-[15px] font-semibold items-center gap-2 group hover:bg-primary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "0 0 10px rgba(68, 227, 211, 0.2)" }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="text-body-sm text-[#859491]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary-fixed transition-colors font-medium">
                Create workspace →
              </Link>
            </p>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-[#1e1e2e]">
            <p className="text-[10px] text-outline-variant font-inter leading-relaxed">
              By signing in you agree to our{" "}
              <a href="#" className="hover:text-[#859491] transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="hover:text-[#859491] transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Context Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#111118] border-l border-[#1e1e2e] relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(38,50,65,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(38,50,65,0.2) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary opacity-5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg space-y-8">
          {/* Diagnostic UI Mockup */}
          <div className="bg-[#0a0a0f] border border-[#263241] rounded-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#263241] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <span className="font-mono text-label-caps text-on-surface uppercase tracking-widest">
                  AI Diagnosis Engine
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-error" />
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-4 font-mono text-data-mono">
              <div className="bg-[#161d26] p-3 rounded border border-[#263241]">
                <div className="text-outline-variant text-[10px] mb-1 uppercase tracking-wider">Current Trace</div>
                <div className="text-error">Exception in thread "main" java.lang.NullPointerException</div>
                <div className="text-[#859491] pl-4">at com.aegis.core.ClusterManager.route(ClusterManager.java:42)</div>
              </div>
              <div className="flex justify-center">
                <ArrowDown size={20} className="text-outline-variant animate-bounce" />
              </div>
              <div className="bg-primary/5 border border-primary/20 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-primary text-[10px] font-bold tracking-widest uppercase">Historical Match Found</div>
                  <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded font-bold">94% SIMILARITY</span>
                </div>
                <div className="text-on-surface mb-1">INC-8821: Redis connection pool exhaustion</div>
                <div className="text-[#859491] text-xs">Resolved 3 months ago by @alex</div>
                <div className="mt-2 text-primary text-xs flex items-center gap-1 cursor-pointer hover:underline">
                  View resolution steps <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Quote */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-primary pl-4">
                <div className="font-inter text-headline-lg font-semibold text-white">94%</div>
                <div className="font-mono text-label-caps text-[#859491] uppercase mt-1">Match Accuracy</div>
              </div>
              <div className="border-l-2 border-[#263241] pl-4">
                <div className="font-inter text-headline-lg font-semibold text-white">50,000+</div>
                <div className="font-mono text-label-caps text-[#859491] uppercase mt-1">Incidents Stored</div>
              </div>
            </div>

            <div className="bg-[#161d26] p-5 rounded-lg border border-[#263241]">
              <div className="text-primary/50 text-3xl mb-2 font-serif">"</div>
              <p className="text-body-base font-inter text-on-surface-variant italic leading-relaxed">
                "We resolved a P0 in 4 minutes because Aegis found the exact same failure from 6 months ago. The compounding value of this platform is incredible."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#263241] flex items-center justify-center font-mono text-primary text-xs">
                  SA
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Staff SRE</div>
                  <div className="font-mono text-[10px] text-[#859491] uppercase">Series C Fintech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
