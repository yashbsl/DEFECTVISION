import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ScanLine,
  Sun,
  Moon,
  Terminal,
  User,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      setMessage("ERROR: PASSKEYS DO NOT MATCH. PLEASE VERIFY ENTRIES.");
      return;
    }

    setMessage("OPERATOR COMMISSIONED SUCCESSFULLY. REDIRECTING TO STUDIO...");
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
          <span className="hidden sm:inline">COMMISSIONING // REGISTRATION CONSOLE</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d5ff38] animate-pulse" />
            <span className="hidden sm:inline">SYSTEM:</span> READY
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

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl border grid lg:grid-cols-12 shadow-2xl" style={{ borderColor: c.line, backgroundColor: c.surface }}>
          {/* LEFT TELEMETRY COLUMN */}
          <div
            className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r relative overflow-hidden"
            style={{ borderColor: c.line, backgroundColor: isDark ? "#12130e" : "#e4e2d6" }}
          >
            <div className="blueprint-grid absolute inset-0 pointer-events-none opacity-20" />

            <div className="relative z-10">
              {/* Brand */}
              <Link to="/" className="flex items-center gap-3 group mb-12">
                <div className="w-9 h-9 bg-[#d5ff38] text-black font-black flex items-center justify-center shrink-0 tracking-tighter group-hover:rotate-90 transition-transform">
                  <ScanLine size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <span className="text-sm font-black tracking-[-0.04em] block uppercase font-sans">
                    DEFECTVISION<span style={{ color: c.signal }}>.</span>
                  </span>
                  <span className="text-[8px] tracking-[0.22em] uppercase block opacity-60">
                    OPERATOR COMMISSIONING
                  </span>
                </div>
              </Link>

              <div className="space-y-4">
                <div className="inline-block px-2 py-0.5 text-[9px] font-bold bg-[#d5ff38] text-black uppercase">
                  ENROLLMENT // NEW OPERATOR
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.9] font-sans uppercase">
                  REGISTER<br />
                  <span className="brutalist-outline">OPERATOR</span>
                  <span style={{ color: c.signal }}>.</span>
                </h1>

                <p className="text-xs opacity-70 leading-relaxed font-mono uppercase pt-2">
                  Create operator credentials to unlock continuous line-scan inspection, bounding box telemetry, and automated coil reject gating.
                </p>
              </div>

              {/* Station perks checklist */}
              <div className="mt-8 space-y-2.5 text-xs opacity-80 pt-4 border-t" style={{ borderColor: c.line }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#d5ff38] shrink-0" />
                  <span>Real-time YOLO11 model inference</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#d5ff38] shrink-0" />
                  <span>Sub-millimeter bounding box coordinates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#d5ff38] shrink-0" />
                  <span>6 Surface defect category classification</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-6 border-t font-mono text-[10px] space-y-2 opacity-75" style={{ borderColor: c.line }}>
              <div className="flex justify-between">
                <span className="opacity-50">SECURITY PROTOCOL:</span>
                <span className="text-[#d5ff38]">DIN EN 10163</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">ROLE PRIVILEGE:</span>
                <span>METALLURGICAL QA LEAD</span>
              </div>
            </div>
          </div>

          {/* RIGHT REGISTRATION FORM */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b" style={{ borderColor: c.line }}>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d5ff38] flex items-center gap-2">
                  <Terminal size={14} />
                  <span>OPERATOR REGISTRATION CONSOLE</span>
                </span>
                <span className="text-[9px] opacity-40 font-mono">NODE: REG-01</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70"
                  >
                    [ 01 ] OPERATOR FULL NAME:
                  </label>
                  <div
                    className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                    style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                  >
                    <span className="px-3.5 opacity-40">
                      <User size={15} />
                    </span>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full py-3 pr-4 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70"
                  >
                    [ 02 ] STATION EMAIL / IDENTIFIER:
                  </label>
                  <div
                    className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                    style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                  >
                    <span className="px-3.5 opacity-40">
                      <Mail size={15} />
                    </span>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@mill-stand.internal"
                      className="w-full py-3 pr-4 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                    />
                  </div>
                </div>

                {/* Password & Confirm Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70"
                    >
                      [ 03 ] PASSKEY:
                    </label>
                    <div
                      className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                      style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                    >
                      <span className="px-3 opacity-40">
                        <Lock size={14} />
                      </span>
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full py-3 pr-2 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm"
                      className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70"
                    >
                      [ 04 ] CONFIRM:
                    </label>
                    <div
                      className="flex items-center border transition-colors focus-within:border-[#d5ff38]"
                      style={{ borderColor: c.line, backgroundColor: isDark ? "#0c0d09" : "#ffffff" }}
                    >
                      <span className="px-3 opacity-40">
                        <Lock size={14} />
                      </span>
                      <input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className="w-full py-3 pr-2 bg-transparent text-xs font-mono outline-none placeholder:opacity-30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2.5 opacity-50 hover:opacity-100"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {message && (
                  <div
                    className={`p-3 border text-xs font-mono uppercase ${
                      message.startsWith("ERROR")
                        ? "bg-[#ff5436]/10 text-[#ff5436] border-[#ff5436]/40"
                        : "bg-[#d5ff38]/10 text-[#d5ff38] border-[#d5ff38]/40"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-[#d5ff38] text-black font-black text-xs uppercase tracking-widest hover:bg-[#c4f024] transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 mt-2"
                >
                  <span>COMMISSION OPERATOR ACCOUNT</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </form>

              {/* Instant Demo Access */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-3 border text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white/70 hover:text-white"
                  style={{ borderColor: c.line }}
                >
                  <Zap size={14} className="text-[#d5ff38]" />
                  <span>BYPASS // TEST DEMO STUDIO DIRECTLY</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="pt-8 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: c.line }}>
              <span className="opacity-60 text-[11px]">ALREADY AN OPERATOR?</span>
              <Link
                to="/login"
                className="font-bold text-[#d5ff38] hover:underline uppercase text-xs tracking-wider flex items-center gap-1.5"
              >
                <span>OPERATOR SIGN IN</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
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
