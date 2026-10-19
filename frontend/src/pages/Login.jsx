
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ScanLine,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  LockKeyhole,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Connect your backend login API here.
      // Example:
      // const response = await axios.post("/api/auth/login", form);
      // Store the returned token securely according to your auth setup.
      // navigate("/dashboard");

      setError("Authentication API is not connected yet.");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f100c] text-[#f5f4ed] font-mono">
      <style>{`
        .auth-grid {
          background-image:
            linear-gradient(to right, #2a2c2218 1px, transparent 1px),
            linear-gradient(to bottom, #2a2c2218 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .auth-input {
          width: 100%;
          background: #11120e;
          border: 1px solid #37392d;
          padding: 14px 15px;
          color: #f5f4ed;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus {
          border-color: #d5ff38;
        }
        .auth-input::placeholder {
          color: #55574c;
        }
      `}</style>

      <header className="flex items-center justify-between border-b border-[#2a2c22] px-5 sm:px-8 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#d5ff38] text-black">
            <ScanLine size={23} />
          </div>
          <div>
            <h1 className="font-sans text-lg font-black tracking-tight">
              DEFECTVISION<span className="text-[#ff5436]">.</span>
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-[#8c8e80]">
              INDUSTRIAL CV ARCHIVE
            </p>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-[#8c8e80] transition hover:text-[#d5ff38] sm:text-xs"
        >
          <ArrowLeft size={14} />
          BACK TO HOME
        </Link>
      </header>

      <section className="auth-grid relative flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden border border-[#2a2c22] bg-[#11120e] lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#2a2c22] bg-[#171813] p-10 lg:flex xl:p-12">
            <div className="absolute -right-24 top-32 h-72 w-72 rounded-full border border-[#d5ff38]/10" />
            <div className="absolute -right-12 top-44 h-48 w-48 rounded-full border border-[#d5ff38]/20" />

            <div className="relative">
              <span className="inline-block border border-[#d5ff38]/30 bg-[#d5ff38]/10 px-3 py-2 text-[10px] font-bold tracking-widest text-[#d5ff38]">
                SYSTEM ACCESS // 001
              </span>

              <h2 className="mt-10 font-sans text-6xl font-black uppercase leading-[0.88] tracking-[-0.07em] xl:text-7xl">
                SEE
                <br />
                THE
                <br />
                <span className="text-transparent [-webkit-text-stroke:1px_#f5f4ed]">
                  UNSEEN
                </span>
                <span className="text-[#ff5436]">.</span>
              </h2>

              <p className="mt-7 max-w-sm text-xs leading-6 text-[#8c8e80]">
                Access your industrial inspection workspace. Detect surface
                anomalies, analyze defect classifications, and review
                inspection results from one place.
              </p>
            </div>

            <div className="relative mt-12 space-y-4">
              <div className="flex items-center gap-3 border-t border-[#37392d] pt-5">
                <ShieldCheck className="text-[#d5ff38]" size={20} />
                <div>
                  <p className="text-[11px] font-bold">SECURE OPERATOR ACCESS</p>
                  <p className="mt-1 text-[9px] text-[#8c8e80]">
                    AUTHENTICATION REQUIRED
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] tracking-widest text-[#55574c]">
                <span>DEFECTVISION.AI</span>
                <span>REV. 2026.10</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 xl:p-14">
            <div className="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#d5ff38]">
              <Activity size={15} />
              AUTHENTICATION / OPERATOR
            </div>

            <h2 className="font-sans text-4xl font-black uppercase tracking-[-0.06em] sm:text-5xl">
              WELCOME
              <br />
              BACK<span className="text-[#ff5436]">.</span>
            </h2>

            <p className="mt-4 text-xs leading-6 text-[#8c8e80]">
              Sign in to continue to your inspection workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                >
                  WORK EMAIL *
                </label>
                <input
                  id="login-email"
                  className="auth-input text-sm"
                  type="email"
                  name="email"
                  placeholder="operator@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                  >
                    PASSWORD *
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-[#d5ff38] hover:underline"
                  >
                    FORGOT PASSWORD?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    className="auth-input pr-12 text-sm"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8e80] hover:text-[#d5ff38]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-xs text-[#8c8e80]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#d5ff38]"
                />
                Remember me on this device
              </label>

              {error && (
                <p
                  role="alert"
                  className="border border-[#ff5436]/40 bg-[#ff5436]/10 p-3 text-xs leading-5 text-[#ff8b76]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-between bg-[#d5ff38] px-5 py-4 text-xs font-black tracking-widest text-black transition hover:bg-[#c4f024] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "SIGNING IN..." : "SIGN IN TO WORKSPACE"}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#2a2c22]" />
              <span className="text-[9px] tracking-widest text-[#55574c]">
                NEW OPERATOR?
              </span>
              <div className="h-px flex-1 bg-[#2a2c22]" />
            </div>

            <Link
              to="/signup"
              className="flex w-full items-center justify-center gap-2 border border-[#37392d] px-5 py-4 text-xs font-bold tracking-widest transition hover:border-[#d5ff38] hover:text-[#d5ff38]"
            >
              CREATE AN ACCOUNT
              <ArrowRight size={15} />
            </Link>

            <div className="mt-8 flex items-center justify-center gap-2 text-[9px] tracking-widest text-[#55574c]">
              <LockKeyhole size={12} />
              SECURE ACCESS // DEFECTVISION.AI
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2a2c22] px-5 py-4 text-center text-[9px] tracking-widest text-[#55574c]">
        © 2026 DEFECTVISION.AI — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}
