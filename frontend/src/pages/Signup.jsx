
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  UserRound,
} from "lucide-react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() ||
        !form.password || !form.confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      // Connect your backend registration API here.
      // Example:
      // await axios.post("/api/auth/register", {
      //   name: form.name.trim(),
      //   email: form.email.trim(),
      //   password: form.password,
      // });
      //
      // On success, navigate to login or verify email.

      setError("Registration API is not connected yet.");
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#37392d] bg-[#11120e] px-4 py-3.5 pr-12 text-sm text-[#f5f4ed] outline-none transition placeholder:text-[#55574c] focus:border-[#d5ff38]";

  return (
    <main className="min-h-screen bg-[#0f100c] font-mono text-[#f5f4ed]">
      <style>{`
        .signup-grid {
          background-image:
            linear-gradient(to right, #2a2c2218 1px, transparent 1px),
            linear-gradient(to bottom, #2a2c2218 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <header className="flex items-center justify-between border-b border-[#2a2c22] px-5 py-5 sm:px-8">
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

      <section className="signup-grid flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden border border-[#2a2c22] bg-[#11120e] lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#2a2c22] bg-[#171813] p-10 lg:flex xl:p-12">
            <div className="absolute -right-20 top-36 h-72 w-72 rounded-full border border-[#d5ff38]/10" />
            <div className="absolute -right-8 top-48 h-48 w-48 rounded-full border border-[#d5ff38]/20" />

            <div className="relative">
              <span className="inline-block border border-[#d5ff38]/30 bg-[#d5ff38]/10 px-3 py-2 text-[10px] font-bold tracking-widest text-[#d5ff38]">
                OPERATOR REGISTRATION // 002
              </span>

              <h2 className="mt-10 font-sans text-6xl font-black uppercase leading-[0.88] tracking-[-0.07em] xl:text-7xl">
                BUILD
                <br />
                YOUR
                <br />
                <span className="text-transparent [-webkit-text-stroke:1px_#f5f4ed]">
                  VISION
                </span>
                <span className="text-[#ff5436]">.</span>
              </h2>

              <p className="mt-7 max-w-sm text-xs leading-6 text-[#8c8e80]">
                Create your operator account and get ready to inspect steel
                surface defects, review detection results, and manage your
                quality-control workflow.
              </p>
            </div>

            <div className="relative mt-12 space-y-5">
              {[
                "Access your inspection workspace",
                "Analyze surface defect classifications",
                "Review detection results in one place",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#37392d] text-[10px] font-bold text-[#d5ff38]">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] text-[#b8b9ad]">{item}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 border-t border-[#37392d] pt-5 text-[9px] tracking-widest text-[#55574c]">
                <ShieldCheck size={14} className="text-[#d5ff38]" />
                DEFECTVISION.AI // SECURE REGISTRATION
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-11 xl:p-12">
            <div className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#d5ff38]">
              <Activity size={15} />
              NEW OPERATOR / REGISTER
            </div>

            <h2 className="font-sans text-4xl font-black uppercase tracking-[-0.06em] sm:text-5xl">
              CREATE
              <br />
              ACCOUNT<span className="text-[#ff5436]">.</span>
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#8c8e80]">
              Register to access the industrial inspection platform.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-2 block text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                >
                  FULL NAME *
                </label>
                <div className="relative">
                  <input
                    id="signup-name"
                    className={inputClass}
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                  <UserRound
                    size={17}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55574c]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                >
                  WORK EMAIL *
                </label>
                <input
                  id="signup-email"
                  className={inputClass}
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
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                >
                  PASSWORD *
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    className={inputClass}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8e80] hover:text-[#d5ff38]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-confirm"
                  className="mb-2 block text-[10px] font-bold tracking-widest text-[#b8b9ad]"
                >
                  CONFIRM PASSWORD *
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    className={inputClass}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8e80] hover:text-[#d5ff38]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 pt-1 text-[10px] leading-5 text-[#8c8e80]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#d5ff38]"
                />
                <span>
                  I agree to the platform's terms of service and privacy policy.
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="border border-[#ff5436]/40 bg-[#ff5436]/10 p-3 text-xs leading-5 text-[#ff8b76]"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="border border-[#d5ff38]/40 bg-[#d5ff38]/10 p-3 text-xs leading-5 text-[#d5ff38]"
                >
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-between bg-[#d5ff38] px-5 py-4 text-xs font-black tracking-widest text-black transition hover:bg-[#c4f024] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? "CREATING ACCOUNT..." : "CREATE OPERATOR ACCOUNT"}
                </span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-7 border-t border-[#2a2c22] pt-6 text-center">
              <p className="text-xs text-[#8c8e80]">
                Already registered?
              </p>
              <Link
                to="/login"
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d5ff38] hover:underline"
              >
                SIGN IN INSTEAD
                <ArrowRight size={14} />
              </Link>
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
