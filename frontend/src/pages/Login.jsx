import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ScanLine,
  ShieldCheck,
  Sun,
  Moon,
  Terminal,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();


  const c = isDark
    ? {
        bg: "#0f100c",
        surface: "#171813",
        surfaceRaised: "#20211a",
        line: "#2a2c22",
        lineLight: "#37392d",
        text: "#f5f4ed",
        muted: "#8c8e80",
        faint: "#55574c",
        lime: "#d5ff38",
        signal: "#ff5436",
      }
    : {
        bg: "#f4f3ec",
        surface: "#eae8de",
        surfaceRaised: "#dedbce",
        line: "#d0cebf",
        lineLight: "#bebcb0",
        text: "#151611",
        muted: "#6e7062",
        faint: "#9ea090",
        lime: "#4e6600",
        signal: "#e0371a",
      };

  function handleSubmit(event) {
    event.preventDefault();
    // Simulate seamless operator authentication & auto-route to dashboard
    setMessage("OPERATOR CREDENTIALS VERIFIED. REDIRECTING TO STUDIO...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 800);
  }

  function handleDemoAccess() {
    navigate("/dashboard");
  }

  return (
    <div
      style={{
        backgroundColor: c.bg,
        color: c.text,
        "--line": c.line,
        "--line-light": c.lineLight,
        "--lime": c.lime,
        "--signal": c.signal,
      }}
      className="min-h-screen selection:bg-[#d5ff38] selection:text-black font-mono transition-colors duration-200 flex flex-col justify-between"
    >
      <style>{`
        .blueprint-grid {
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, var(--line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line) 1px, transparent 1px);
        }
        .brutalist-outline {
          color: transparent;
          -webkit-text-stroke: 1.5px currentColor;
        }
      `}</style>

      {/* TOP STATUS BAR */}
      <div
        className="border-b text-[10px] uppercase tracking-[0.18em] px-4 sm:px-8 py-2 flex items-center justify-between"
        style={{ borderColor: c.line, backgroundColor: c.surface, color: c.muted }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold hover:text-[#d5ff38] transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            <span>RETURN TO ARCHIVE [ ESC ]</span>
          </Link>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:inline">TERMINAL ACCESS // NODE 04B</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d5ff38] animate-pulse" />
            <span className="hidden sm:inline">FASTAPI PORT 8000:</span> ONLINE
          </span>
          <button
            onClick={toggleTheme}
            className="border px-2 py-0.5 text-[9px] font-bold uppercase transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: c.line }}
          >
            {isDark ? "LIGHT" : "DARK"}
          </button>
        </div>
      </div>

      {/* MAIN CONSOLE CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl border grid lg:grid-cols-12 shadow-2xl" style={{ borderColor: c.line, backgroundColor: c.surface }}>
          {/* LEFT TELEMETRY COLUMN */}
          <div
            className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r relative overflow-hidden"
            style={{ borderColor: c.line, backgroundColor: isDark ? "#12130e" : "#e4e2d6" }}
          >
            {/* Blueprint grid background */}
            <div className="blueprint-grid absolute inset-0 pointer-events-none opacity-20" />

            <div className="relative z-10">
              {/* Brand mark */}
              <Link to="/" className="flex items-center gap-3 group mb-12">
                <div className="w-9 h-9 bg-[#d5ff38] text-black font-black flex items-center justify-center shrink-0 tracking-tighter group-hover:rotate-90 transition-transform">
                  <ScanLine size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <span className="text-sm font-black tracking-[-0.04em] block uppercase font-sans">
                    DEFECTVISION<span style={{ color: c.signal }}>.</span>
                  </span>
                  <span className="text-[8px] tracking-[0.22em] uppercase block opacity-60">
                    OPERATOR CLEARANCE
                  </span>
                </div>
              </Link>

              <div className="space-y-4">
                <div className="inline-block px-2 py-0.5 text-[9px] font-bold bg-[#d5ff38] text-black uppercase">
                  CLEARANCE LEVEL // 03
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.9] font-sans uppercase">
                  OPERATOR<br />
                  <span className="brutalist-outline">SIGN IN</span>
                  <span style={{ color: c.signal }}>.</span>
                </h1>

                <p className="text-xs opacity-70 leading-relaxed font-mono uppercase pt-2">
                  Access the live neural inspection terminal, real-time bounding box telemetry, and automated coil audit logs.
                </p>
              </div>
            </div>

            {/* Diagnostic Terminal readout */}
            <div className="relative z-10 mt-12 pt-6 border-t font-mono text-[10px] space-y-2 opacity-75" style={{ borderColor: c.line }}>
              <div className="flex justify-between">
                <span className="opacity-50">SECURITY PROFILE:</span>
                <span className="text-[#d5ff38]">ISO/IEC 27001</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">DEFECT CLASSES:</span>
                <span>NEU-DET 001—006</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">INSPECTION ENGINE:</span>
                <span>YOLO11 IMPROVED</span>
              </div>
            </div>
          </div>

          {/* RIGHT AUTH CONSOLE FORM */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b" style={{ borderColor: c.line }}>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d5ff38] flex items-center gap-2">
                  <Terminal size={14} />
                  <span>CREDENTIAL INPUT CONSOLE</span>
                </span>
                <span className="text-[9px] opacity-40 font-mono">PORT: 8000</span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70"
                  >
                    [ 01 ] OPERATOR IDENTIFIER / EMAIL:
                  </label>
                  <div
                    className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                    style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                  >
                    <span className="px-3.5 opacity-40">
                      <Mail size={15} />
                    </span>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@mill-stand.internal"
                      className="w-full py-3.5 pr-4 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="login-password"
                      className="text-[10px] font-bold uppercase tracking-wider opacity-70"
                    >
                      [ 02 ] ACCESS PASSKEY:
                    </label>
                    <span className="text-[9px] opacity-40 uppercase">MIN 8 CHARS</span>
                  </div>
                  <div
                    className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                    style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                  >
                    <span className="px-3.5 opacity-40">
                      <Lock size={15} />
                    </span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full py-3.5 pr-2 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3.5 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Status / Message Display */}
                {message && (
                  <div className="p-3 border text-xs font-mono uppercase bg-[#d5ff38]/10 text-[#d5ff38] border-[#d5ff38]/40">
                    {message}
                  </div>
                )}

                {/* Main Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#d5ff38] text-black font-black text-xs uppercase tracking-widest hover:bg-[#c4f024] transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5"
                >
                  <span>AUTHENTICATE OPERATOR</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </form>

              {/* Instant Demo Access (No password required for immediate inspection) */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-3 border text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white/70 hover:text-white"
                  style={{ borderColor: c.line }}
                >
                  <Zap size={14} className="text-[#d5ff38]" />
                  <span>BYPASS AUTH // QUICK DEMO ACCESS</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Bottom Form Footer Link */}
            <div className="pt-8 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: c.line }}>
              <span className="opacity-60 text-[11px]">NEW OPERATOR ON SITE?</span>
              <Link
                to="/signup"
                className="font-bold text-[#d5ff38] hover:underline uppercase text-xs tracking-wider flex items-center gap-1.5"
              >
                <span>REGISTER OPERATOR ID</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER STRIP */}
      <footer
        className="border-t text-[10px] uppercase tracking-widest px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderColor: c.line, backgroundColor: c.surface, color: c.muted }}
      >
        <span>DEFECTVISION AI // AUTOMATED METALLURGICAL QUALITY ASSURANCE</span>
        <span>© 2026 ARCHIVE REVISION 04</span>
      </footer>
    </div>
  );
}
