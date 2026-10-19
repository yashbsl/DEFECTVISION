import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Crosshair,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gauge,
  History,
  ImagePlus,
  Images,
  Layers,
  ListTodo,
  LoaderCircle,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RefreshCw,
  Scan,
  ScanLine,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";
import { inspectImage, inspectBatch, getBackendHealth } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SAMPLE_DEFECTS = [
  { name: "Crazing",   file: "crazing_241.jpg",        code: "01", color: "#ff5436" },
  { name: "Inclusion", file: "inclusion_241.jpg",      code: "02", color: "#ff5436" },
  { name: "Patches",   file: "patches_241.jpg",        code: "03", color: "#eab308" },
  { name: "Pitted",    file: "pitted_surface_241.jpg", code: "04", color: "#0284c7" },
  { name: "Scale",     file: "rolled-in_scale_241.jpg",code: "05", color: "#9333ea" },
  { name: "Scratches", file: "scratches_241.jpg",      code: "06", color: "#16a34a" },
];

const INITIAL_QUEUE = [];
const INITIAL_COMPLETED = [];

function prettyName(name = "") {
  return name.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function confidencePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n));
}

function calculateVerdict(detections) {
  if (!detections || detections.length === 0) {
    return {
      grade: "GRADE A", status: "PASS",
      title: "100% CLEARANCE // ZERO DEFECTS DETECTED",
      colorText: "text-emerald-600 dark:text-[#d5ff38]",
      border: "border-emerald-500/30 dark:border-[#d5ff38]/40",
      bg: "bg-emerald-500/10 dark:bg-[#d5ff38]/10",
      badge: "bg-emerald-600 text-white dark:bg-[#d5ff38] dark:text-black",
      action: "Coil passed metallurgical standards. Dispatched to automated strapping.",
    };
  }
  const hasCritical = detections.some((d) => d.defect === "inclusion" || d.defect === "crazing");
  if (hasCritical || detections.length >= 3) {
    return {
      grade: "GRADE C", status: "REJECT",
      title: "REJECT // CRITICAL DEFECT ISOLATED",
      colorText: "text-rose-600 dark:text-[#ff5436]",
      border: "border-rose-500/30 dark:border-[#ff5436]/40",
      bg: "bg-rose-500/10 dark:bg-[#ff5436]/10",
      badge: "bg-rose-600 text-white dark:bg-[#ff5436] dark:text-black",
      action: "Coil marked with orange dye. Automated re-mill diversion executed.",
    };
  }
  return {
    grade: "GRADE B", status: "WARNING",
    title: "CONDITION B // SECONDARY SURFACE REVIEW",
    colorText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30 dark:border-amber-400/40",
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    badge: "bg-amber-500 text-white dark:bg-amber-400 dark:text-black",
    action: "Surface marks within tolerance limits. Routed to finishing stand for mechanical grinding.",
  };
}

// ─── PROFILE DATA (stored in localStorage) ────────────────────────
const DEFAULT_PROFILE = {
  name: "Alex Mercer",
  role: "QA Lead Engineer",
  plant: "Rolling Mill Plant 04B",
  email: "alex.mercer@steelworks.io",
  department: "Surface Quality Assurance",
  shift: "Morning Shift A (06:00 - 14:00)",
  employeeId: "EMP-77421",
  certifications: "ISO 9001, ASTM A370, NEU-DET Certified",
  joinDate: "2021-03-15",
  totalInspections: 0,
  avgAccuracy: "Not measured",
  notifEmail: true,
  notifCritical: true,
  notifBatch: false,
  darkModeDefault: true,
};

function loadProfile() {
  try {
    const stored = localStorage.getItem("defectvision-profile");
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
}

function saveProfile(profile) {
  try { localStorage.setItem("defectvision-profile", JSON.stringify(profile)); } catch {}
}

export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme();

  // ── Navigation
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  // ── Inspector — Single file
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  // ── Inspector — Multi-file / Batch
  const [uploadMode, setUploadMode] = useState("single"); // "single" | "batch"
  const [batchFiles, setBatchFiles] = useState([]);       // array of File
  const [batchResults, setBatchResults] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");

  // ── Viewer Controls
  const [viewMode, setViewMode] = useState("split");
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState(15);
  const [selectedDetection, setSelectedDetection] = useState(null);

  // ── Auto-Scan
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [autoScanIndex, setAutoScanIndex] = useState(0);

  // ── Tasks
  const [pendingTasks, setPendingTasks] = useState(INITIAL_QUEUE);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("defectvision-inspections") || "[]"); } catch { return INITIAL_COMPLETED; }
  });
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("ALL");

  // ── Backend status
  const [backendStatus, setBackendStatus] = useState("checking"); // "checking" | "online" | "offline"
  const [backendInfo, setBackendInfo] = useState(null);

  // ── Profile
  const [profile, setProfile] = useState(loadProfile);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState(loadProfile);

  const sliderRef = useRef(null);

  // ── Backend health check on mount
  useEffect(() => {
    getBackendHealth()
      .then((info) => { setBackendStatus("online"); setBackendInfo(info); })
      .catch(() => setBackendStatus("offline"));
  }, []);

  // ── Preview for single file
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Auto-Scan loop
  useEffect(() => {
    let t;
    if (autoScanActive) {
      t = setInterval(() => {
        const next = (autoScanIndex + 1) % SAMPLE_DEFECTS.length;
        setAutoScanIndex(next);
        loadPresetSample(SAMPLE_DEFECTS[next].file);
      }, 4000);
    }
    return () => clearInterval(t);
  }, [autoScanActive, autoScanIndex]);

  // ── Theme palette (high-contrast)
  const c = isDark ? {
    bg: "bg-[#0b0c08] text-[#f5f4ed]",
    surface: "bg-[#141510]",
    surfaceRaised: "bg-[#1c1d16]",
    line: "border-[#25271d]",
    textPrimary: "text-[#f5f4ed]",
    textSecondary: "text-[#9ca3af]",
    textMuted: "text-[#6b7280]",
    accent: "bg-[#d5ff38] text-black",
    accentText: "text-[#d5ff38]",
    accentButton: "bg-[#d5ff38] text-black hover:bg-[#c8f230] border-transparent",
    signalText: "text-[#ff5436]",
    hover: "hover:bg-white/5",
    activeItem: "bg-[#d5ff38]/15 border-l-2 border-[#d5ff38] text-[#d5ff38] font-bold",
    input: "bg-[#1c1d16] border-[#25271d] text-[#f5f4ed] focus:border-[#d5ff38]",
  } : {
    bg: "bg-[#f8f7f2] text-[#0f172a]",
    surface: "bg-[#ffffff]",
    surfaceRaised: "bg-[#f1efe6]",
    line: "border-[#e2dfd4]",
    textPrimary: "text-[#0f172a]",
    textSecondary: "text-[#475569]",
    textMuted: "text-[#64748b]",
    accent: "bg-[#d5ff38] text-black border border-black/10",
    accentText: "text-[#365314]",
    accentButton: "bg-[#365314] text-white hover:bg-[#254d0f] border-transparent",
    signalText: "text-[#dc2626]",
    hover: "hover:bg-black/5",
    activeItem: "bg-[#d5ff38]/30 border-l-2 border-[#4d7c0f] text-[#1e3a8a] font-black",
    input: "bg-white border-[#e2dfd4] text-[#0f172a] focus:border-[#365314]",
  };

  // ────────────────── FILE HELPERS ──────────────────
  const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp"];

  function acceptSingleFile(f) {
    if (!f) return;
    if (!VALID_TYPES.includes(f.type)) { setError("JPG, PNG, WEBP or BMP only."); return; }
    if (f.size > MAX_FILE_SIZE) { setError("Max file size is 10 MB."); return; }
    setFile(f); setResult(null); setError(""); setSelectedDetection(null);
  }

  function acceptBatchFiles(fileList) {
    const valid = Array.from(fileList).filter((f) => VALID_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE);
    if (valid.length === 0) { setBatchError("No valid images found (JPG/PNG/WEBP/BMP, max 10 MB each)."); return; }
    setBatchFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const fresh = valid.filter((f) => !names.has(f.name));
      return [...prev, ...fresh];
    });
    setBatchResults(null); setBatchError("");
  }

  function handleSingleFileChange(e) { acceptSingleFile(e.target.files?.[0]); e.target.value = ""; }
  function handleBatchFileChange(e) { acceptBatchFiles(e.target.files); e.target.value = ""; }
  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    if (uploadMode === "batch") acceptBatchFiles(e.dataTransfer.files);
    else acceptSingleFile(e.dataTransfer.files?.[0]);
  }

  async function loadPresetSample(fileName) {
    try {
      const res = await fetch(`/samples/${fileName}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const f = new File([blob], fileName, { type: "image/jpeg" });
      if (uploadMode === "batch") acceptBatchFiles([f]);
      else acceptSingleFile(f);
    } catch { setError("Failed to load sample."); }
  }

  // ────────────────── SINGLE INSPECT ──────────────────
  async function handleAnalyze() {
    if (!file || loading) return;
    setLoading(true); setError(""); setResult(null); setSelectedDetection(null);
    try {
      const data = await inspectImage(file, confidenceFilter / 100);
      setResult(data);
      addToCompleted(file.name, data.detections || [], data.latency_ms, data.grade, data.verdict);
    } catch (err) {
      setError(err.message || "Cannot connect to backend on port 8000. Start FastAPI first.");
      setBackendStatus("offline");
    } finally { setLoading(false); }
  }

  // ────────────────── BATCH INSPECT ──────────────────
  async function handleBatchAnalyze() {
    if (batchFiles.length === 0 || batchLoading) return;
    setBatchLoading(true); setBatchError(""); setBatchResults(null);
    try {
      const data = await inspectBatch(batchFiles, confidenceFilter / 100);
      setBatchResults(data);
      // Add each result to completed log
      data.results.forEach((r) => {
        addToCompleted(r.filename, r.detections || [], r.latency_ms, r.grade, r.verdict);
      });
    } catch (err) {
      setBatchError(err.message || "Batch prediction failed. Check backend.");
      setBackendStatus("offline");
    } finally { setBatchLoading(false); }
  }

  function addToCompleted(filename, detections, latencyMs, grade, verdict) {
    const detectedVerdict = verdict || calculateVerdict(detections).status;
    const record = {
      id: `INS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      specimen: filename,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      defectCount: detections.length,
      primaryDefect: detections[0]?.defect || "none",
      confidence: detections[0] ? `${(confidencePercent(detections[0].confidence)).toFixed(1)}%` : "—",
      verdict: detectedVerdict,
      grade: grade || calculateVerdict(detections).grade,
      operator: profile.name,
      latency: Number.isFinite(Number(latencyMs)) ? `${Number(latencyMs).toFixed(1)}ms` : "—",
      latencyMs: Number.isFinite(Number(latencyMs)) ? Number(latencyMs) : null,
      detections: (detections || []).map((d) => ({ defect: d.defect || "unknown", confidence: Number(d.confidence) || 0 })),
    };
    setCompletedTasks((prev) => {
      const next = [record, ...prev];
      try { sessionStorage.setItem("defectvision-inspections", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // ────────────────── SLIDER ──────────────────
  function handleSliderMove(e) {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSliderPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
  }

  // ────────────────── QUEUE ──────────────────
  function runQueueTask(task) { if (task?.sample) loadPresetSample(task.sample); setActiveTab("inspector"); }
  function simulateProcessBatch() {
    setIsProcessingQueue(true);
    setTimeout(() => { setPendingTasks((p) => p.map((t) => ({ ...t, status: "COMPLETED", progress: 100 }))); setIsProcessingQueue(false); }, 1800);
  }

  // ────────────────── CSV EXPORT ──────────────────
  function exportCSV() {
    const rows = [
      ["TASK_ID","COIL_ID","SPECIMEN","TIMESTAMP","DEFECTS","PRIMARY_CLASS","CONFIDENCE","GRADE","VERDICT","OPERATOR","LATENCY"],
      ...completedTasks.map((t) => [t.id,t.coilId,t.specimen,t.time,t.defectCount,t.primaryDefect,t.confidence,t.grade,t.verdict,t.operator,t.latency||"—"]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `defect_audit_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  // ────────────────── PROFILE SAVE ──────────────────
  function saveProfileEdits() {
    setProfile(profileDraft);
    saveProfile(profileDraft);
    setProfileEditing(false);
  }

  // ─────────────── DERIVED STATE ───────────────
  const rawDetections = result?.detections || [];
  const filteredDetections = rawDetections.filter((d) => confidencePercent(d.confidence) >= confidenceFilter);
  const currentVerdict = calculateVerdict(filteredDetections);
  const totalInspections = completedTasks.length;
  const passCount = completedTasks.filter((t) => t.verdict === "PASS").length;
  const warningCount = completedTasks.filter((t) => t.verdict === "WARNING").length;
  const rejectCount = completedTasks.filter((t) => t.verdict === "REJECT").length;
  const successRate = totalInspections ? (passCount / totalInspections) * 100 : null;
  const avgLatency = completedTasks.filter((t) => Number.isFinite(t.latencyMs)).length
    ? completedTasks.filter((t) => Number.isFinite(t.latencyMs)).reduce((sum, t) => sum + t.latencyMs, 0) / completedTasks.filter((t) => Number.isFinite(t.latencyMs)).length
    : null;
  const defectCounts = completedTasks.flatMap((t) => t.detections || []).reduce((acc, d) => {
    const key = d.defect || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const defectDistribution = Object.entries(defectCounts).sort((a, b) => b[1] - a[1]);
  const displayedCompleted = completedTasks.filter((t) => {
    // Older/session records may not contain every field; normalize before searching.
    const query = String(historySearch || "").toLowerCase();
    const coilId = String(t?.coilId || "");
    const specimen = String(t?.specimen || t?.filename || "");
    const primaryDefect = String(t?.primaryDefect || t?.detections?.[0]?.defect || "none");
    const matchSearch = coilId.toLowerCase().includes(query) ||
                        specimen.toLowerCase().includes(query) ||
                        primaryDefect.toLowerCase().includes(query);
    return matchSearch && (historyFilter === "ALL" || t?.verdict === historyFilter);
  });

  const TABS = [
    { id: "analytics", label: "INSPECTION ANALYTICS", badge: `${completedTasks.length} RUNS`, icon: <BarChart3 size={18} /> },
    { id: "inspector", label: "LIVE INSPECTOR",        badge: "STUDIO",     icon: <Crosshair size={18} /> },
    { id: "queue",     label: "BATCH QUEUE",           badge: `${pendingTasks.filter((t) => t.status !== "COMPLETED").length} PENDING`, badgeColor: "bg-amber-500 text-black", icon: <ListTodo size={18} /> },
    { id: "history",   label: "COMPLETED AUDIT",       badge: `${completedTasks.length} RUNS`, icon: <History size={18} /> },
    { id: "benchmarks",label: "MODEL INFO",      badge: "API",  icon: <Cpu size={18} /> },
    { id: "profile",   label: "OPERATOR PROFILE",      badge: profile.role.split(" ")[0].toUpperCase(), icon: <User size={18} /> },
  ];

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className={`dashboard-shell min-h-screen flex flex-col font-mono selection:bg-[#d5ff38] selection:text-black transition-colors duration-200 ${c.bg}`}>

      <style>{`
        .dashboard-shell { --dv-accent: #d5ff38; }
        .dashboard-shell main { min-width: 0; }
        .dashboard-shell button { -webkit-tap-highlight-color: transparent; }
        .dashboard-shell button:focus-visible,
        .dashboard-shell input:focus-visible,
        .dashboard-shell label:focus-within { outline: 2px solid var(--dv-accent); outline-offset: 2px; }
        .dashboard-shell main > div { animation: dv-enter .22s ease-out; }
        .dashboard-shell main [class*="border"] { transition: border-color .18s ease, background-color .18s ease, transform .18s ease; }
        .dashboard-shell main [class*="grid"] > [class*="border"]:hover { border-color: ${isDark ? "#454936" : "#b7c2a2"}; }
        .dashboard-shell .dv-scroll-x { max-width: 100%; overflow-x: auto; }
        @keyframes dv-enter { from { opacity: .65; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 767px) {
          .dashboard-shell { width: 100%; max-width: 100vw; overflow-x: hidden; }
          .dashboard-shell main {
            width: 100%; min-width: 0; max-width: 100%;
            padding: 12px; gap: 16px; overflow-x: hidden;
          }
          .dashboard-shell main > div { min-width: 0; max-width: 100%; }
          .dashboard-shell main h2,
          .dashboard-shell main h3,
          .dashboard-shell main p { overflow-wrap: anywhere; }
          .dashboard-shell header { width: 100%; max-width: 100%; }
          .dashboard-shell header > div { min-width: 0; }
          .dashboard-shell aside {
            position: fixed !important;
            left: 0; top: 56px; bottom: 0;
            z-index: 45;
            width: min(82vw, 280px) !important;
            max-height: calc(100dvh - 56px);
            box-shadow: 12px 0 36px rgba(0,0,0,.28);
            transform: translateX(-105%);
            transition: transform .22s ease;
          }
          .dashboard-shell aside.mobile-sidebar-open { transform: translateX(0); }
          .dashboard-shell aside.mobile-sidebar-closed { transform: translateX(-105%); }
          .dashboard-shell .mobile-sidebar-backdrop {
            position: fixed; inset: 56px 0 0; z-index: 40;
            background: rgba(0,0,0,.55); border: 0;
          }
          .dashboard-shell main img { max-width: 100%; }
          .dashboard-shell main input,
          .dashboard-shell main select,
          .dashboard-shell main textarea { min-width: 0; max-width: 100%; }
          .dashboard-shell .dv-scroll-x {
            width: 100%; max-width: 100%; overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
        @media (max-width: 480px) {
          .dashboard-shell main { padding: 10px; gap: 12px; }
          .dashboard-shell main .text-3xl { font-size: 1.5rem; line-height: 2rem; }
          .dashboard-shell main [class~="p-6"] { padding: 12px; }
          .dashboard-shell main [class~="p-5"] { padding: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-shell main > div { animation: none; }
          .dashboard-shell main [class*="border"] { transition: none; }
        }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <header className={`border-b ${c.line} ${c.surface} sticky top-0 z-50 text-xs select-none h-14 flex items-stretch justify-between shrink-0`}>
        <div className="flex items-stretch">
          <button type="button" aria-label={sidebarCollapsed ? "Open navigation menu" : "Close navigation menu"} onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`px-4 border-r ${c.line} ${c.hover} flex items-center justify-center`}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} className={c.accentText} /> : <PanelLeftClose size={18} className={c.accentText} />}
          </button>
          <Link to="/" className={`flex items-center gap-3 px-4 sm:px-5 border-r ${c.line} ${c.hover} group`}>
            <div className="w-8 h-8 bg-[#d5ff38] text-black font-black flex items-center justify-center group-hover:rotate-90 transition-transform">
              <ScanLine size={18} strokeWidth={2.4} />
            </div>
            <div className="hidden sm:block">
              <span className={`font-black text-sm uppercase tracking-tight font-sans block leading-none ${c.textPrimary}`}>DEFECTVISION<span className={c.signalText}>.</span></span>
              <span className={`text-[8px] tracking-[0.2em] uppercase block mt-0.5 ${c.textMuted}`}>QA STUDIO v2</span>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-3 px-6 text-[11px] font-bold uppercase tracking-wider">
            <span className={c.textMuted}>WORKSPACE //</span>
            <span className={`${isDark ? "text-[#d5ff38]" : "text-slate-900"} font-black`}>
              {TABS.find((t) => t.id === activeTab)?.label}
            </span>
          </div>
        </div>

        {/* Centre — live telemetry */}
        <div className="hidden xl:flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className={`w-2 h-2 rounded-full ${backendStatus === "online" ? "bg-emerald-500 animate-pulse" : backendStatus === "offline" ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
            <span className={c.textPrimary}>API: {backendStatus.toUpperCase()}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className={isDark ? "text-[#d5ff38]" : "text-emerald-800"}>PASS RATE:</span>
            <span className="font-black text-emerald-500">{successRate === null ? "—" : `${successRate.toFixed(1)}%`}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className={c.textMuted}>SESSION INSPECTIONS:</span>
            <span className={c.textPrimary}>{completedTasks.length}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-stretch">
          <Link to="/" className={`flex items-center gap-2 px-4 border-l text-[11px] font-bold uppercase tracking-wider ${c.line} ${c.hover} ${c.textSecondary}`}>
            <ArrowLeft size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">EXIT</span>
          </Link>
          <button onClick={toggleTheme} className={`flex items-center gap-2 px-4 border-l text-[11px] font-black uppercase tracking-wider transition-colors ${c.line} ${c.hover}`}>
            {isDark ? <Sun size={15} className="text-[#d5ff38]" /> : <Moon size={15} className="text-slate-900" />}
            <span className={`hidden sm:inline ${isDark ? "text-white" : "text-slate-900"}`}>{isDark ? "LIGHT" : "DARK"}</span>
          </button>
          <button onClick={() => setActiveTab("profile")} className={`hidden sm:flex items-center gap-2.5 px-5 border-l text-[10px] font-bold uppercase tracking-wider ${c.line} ${c.hover}`}>
            <div className="w-6 h-6 rounded-full bg-[#d5ff38] text-black flex items-center justify-center font-black text-xs">
              {profile.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className={c.textPrimary}>{profile.name.split(" ")[0]} [{profile.role.split(" ")[0]}]</span>
          </button>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {!sidebarCollapsed && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="mobile-sidebar-backdrop md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── SIDEBAR ─── */}
        <aside className={`border-r ${c.line} ${c.surface} flex flex-col justify-between transition-all duration-200 select-none shrink-0 md:translate-x-0 ${sidebarCollapsed ? "w-14 mobile-sidebar-closed" : "w-60 sm:w-64 mobile-sidebar-open"}`}>
          <div className="p-2 space-y-0.5 overflow-y-auto">
            {!sidebarCollapsed && <div className={`px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] ${c.textMuted}`}>CONTROL CHANNELS</div>}
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 768) setSidebarCollapsed(true); }}
                  title={sidebarCollapsed ? tab.label : undefined}
                  className={`w-full flex items-center justify-between p-3 text-xs tracking-wider uppercase transition-colors ${active ? c.activeItem : `${c.hover} ${c.textSecondary}`}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={active ? (isDark ? "text-[#d5ff38]" : "text-emerald-800") : c.textMuted}>{tab.icon}</span>
                    {!sidebarCollapsed && <span className="font-bold truncate text-[11px]">{tab.label}</span>}
                  </div>
                  {!sidebarCollapsed && tab.badge && (
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded-sm ${tab.badgeColor || (isDark ? "bg-white/10 text-white" : "bg-black/10 text-black")}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar bottom strip */}
          <div className={`p-3 border-t ${c.line} ${c.surfaceRaised} text-[10px]`}>
            {!sidebarCollapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>BACKEND:</span>
                  <span className={`font-black ${backendStatus === "online" ? "text-emerald-500" : "text-rose-500"}`}>{backendStatus.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>LATENCY:</span>
                  <span className={`font-bold ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>{backendInfo ? `${backendInfo.uptime_seconds}s UP` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>MODEL:</span>
                  <span className={`font-bold ${c.textPrimary}`}>YOLO11-IMP</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center" title={`Backend: ${backendStatus}`}>
                <div className={`w-3 h-3 rounded-full ${backendStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
            )}
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 flex flex-col gap-5 lg:gap-6">

          {/* ═══════════ TAB: ANALYTICS ═══════════ */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>LIVE INSPECTION ANALYTICS</h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>Metrics are calculated from actual predictions in this browser session.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 border text-[10px] font-bold uppercase ${backendStatus === "online" ? "bg-emerald-500/10 text-emerald-600 dark:text-[#d5ff38] border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30"}`}>{backendStatus === "online" ? "BACKEND CONNECTED" : backendStatus === "checking" ? "CHECKING API…" : "BACKEND OFFLINE"}</span>
                  <button onClick={() => setActiveTab("inspector")} className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${c.accentButton}`}><Crosshair size={13} />LAUNCH INSPECTOR ↗</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "ACTUAL INSPECTIONS", value: totalInspections.toLocaleString(), note: "Successful API predictions", icon: <ScanLine size={18} />, color: isDark ? "text-[#d5ff38]" : "text-emerald-700" },
                  { label: "PASS RATE", value: successRate === null ? "—" : `${successRate.toFixed(1)}%`, note: `${passCount} passed · ${totalInspections} total`, icon: <ShieldCheck size={18} />, color: "text-emerald-500" },
                  { label: "REJECTED", value: rejectCount.toLocaleString(), note: `${warningCount} warnings`, icon: <ShieldAlert size={18} />, color: "text-rose-500" },
                  { label: "AVG INFERENCE", value: avgLatency === null ? "—" : `${avgLatency.toFixed(1)} ms`, note: "From backend latency_ms", icon: <Zap size={18} />, color: isDark ? "text-[#d5ff38]" : "text-emerald-700" },
                ].map((kpi) => (
                  <div key={kpi.label} className={`p-5 border ${c.line} ${c.surface}`}>
                    <div className="flex items-center justify-between"><div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>{kpi.label}</div><span className={kpi.color}>{kpi.icon}</span></div>
                    <div className={`text-3xl font-black font-sans mt-3 ${kpi.color}`}>{kpi.value}</div>
                    <div className={`text-[10px] mt-2 uppercase ${c.textMuted}`}>{kpi.note}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`p-5 sm:p-6 border ${c.line} ${c.surface}`}>
                  <div className="flex items-center justify-between gap-3 mb-5"><h3 className={`text-xs font-black uppercase tracking-wider ${c.textPrimary}`}>DETECTED DEFECT CLASSES</h3><span className={`text-[10px] uppercase ${c.textMuted}`}>{Object.values(defectCounts).reduce((a, b) => a + b, 0)} detections</span></div>
                  {defectDistribution.length ? <div className="space-y-4">
                    {defectDistribution.map(([name, count]) => {
                      const total = defectDistribution.reduce((sum, item) => sum + item[1], 0);
                      const pct = total ? (count / total) * 100 : 0;
                      return <div key={name} className="space-y-1.5"><div className="flex justify-between gap-3 text-[10px] font-bold uppercase"><span className={c.textPrimary}>{prettyName(name)}</span><span className={c.textMuted}>{count} · {pct.toFixed(1)}%</span></div><div className="h-2.5 bg-black/10 dark:bg-white/10"><div className="h-full bg-[#d5ff38]" style={{ width: `${pct}%` }} /></div></div>;
                    })}
                  </div> : <div className={`py-12 text-center border border-dashed ${c.line}`}><ScanLine size={28} className={`mx-auto mb-3 ${c.textMuted}`} /><p className={`text-xs font-bold uppercase ${c.textPrimary}`}>No real detection data yet</p><p className={`text-[10px] mt-2 ${c.textMuted}`}>Inspect an image to populate this chart.</p><button onClick={() => setActiveTab("inspector")} className={`mt-4 px-4 py-2 text-[10px] font-black uppercase border ${c.accentButton}`}>Inspect an image</button></div>}
                </div>

                <div className={`p-5 sm:p-6 border ${c.line} ${c.surface}`}>
                  <div className="flex items-center justify-between gap-3 mb-5"><h3 className={`text-xs font-black uppercase tracking-wider ${c.textPrimary}`}>VERDICT BREAKDOWN</h3><span className={`text-[10px] uppercase ${c.textMuted}`}>Session totals</span></div>
                  {totalInspections ? <div className="space-y-5">
                    {[{label:"PASS",count:passCount,color:"bg-emerald-500"},{label:"WARNING",count:warningCount,color:"bg-amber-500"},{label:"REJECT",count:rejectCount,color:"bg-rose-500"}].map((item) => <div key={item.label} className="space-y-1.5"><div className="flex justify-between text-[10px] font-bold uppercase"><span className={c.textPrimary}>{item.label}</span><span className={c.textMuted}>{item.count} / {totalInspections}</span></div><div className="h-3 bg-black/10 dark:bg-white/10"><div className={`${item.color} h-full`} style={{width:`${(item.count/totalInspections)*100}%`}} /></div></div>)}
                    <p className={`text-[10px] uppercase ${c.textMuted}`}>PASS rate is calculated as PASS inspections divided by all recorded inspections. This is not model accuracy.</p>
                  </div> : <div className={`py-12 text-center border border-dashed ${c.line}`}><BarChart3 size={28} className={`mx-auto mb-3 ${c.textMuted}`} /><p className={`text-xs font-bold uppercase ${c.textPrimary}`}>Waiting for inspections</p><p className={`text-[10px] mt-2 ${c.textMuted}`}>Verdict statistics appear after an image is inspected.</p></div>}
                </div>
              </div>

              <div className={`border ${c.line} ${c.surface}`}>
                <div className="p-5 border-b border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className={`text-xs font-black uppercase tracking-wider ${c.textPrimary}`}>RECENT REAL INSPECTIONS</h3><p className={`text-[10px] mt-1 uppercase ${c.textMuted}`}>Stored for this browser session</p></div><button onClick={() => setActiveTab("history")} className={`text-[10px] font-black uppercase border px-3 py-2 ${c.line} ${c.hover}`}>View history ↗</button></div>
                {completedTasks.length ? <div className="divide-y divide-current/10">{completedTasks.slice(0,5).map((item) => <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="min-w-0"><p className={`text-xs font-bold truncate ${c.textPrimary}`}>{item.specimen}</p><p className={`text-[10px] mt-1 uppercase ${c.textMuted}`}>{item.time} · {item.defectCount} detections · {item.latency}</p></div><span className={`self-start sm:self-auto px-3 py-1 text-[10px] font-black ${item.verdict === "PASS" ? "bg-emerald-600 text-white" : item.verdict === "REJECT" ? "bg-rose-600 text-white" : "bg-amber-500 text-black"}`}>{item.verdict}</span></div>)}</div> : <div className={`p-8 text-center text-xs uppercase ${c.textMuted}`}>No inspections recorded yet. Upload and inspect an image to show real results here.</div>}
              </div>
            </div>
          )}

          {/* ═══════════ TAB: LIVE INSPECTOR ═══════════ */}
          {activeTab === "inspector" && (
            <div className="space-y-6">
              {/* Upload mode toggle + presets */}
              <div className={`p-3 border ${c.line} ${c.surface} flex flex-wrap items-center justify-between gap-3 text-xs`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mode Toggle */}
                  <div className={`flex items-center border ${c.line} text-[10px] font-bold`}>
                    <button onClick={() => { setUploadMode("single"); setBatchFiles([]); setBatchResults(null); }}
                      className={`px-3 py-1.5 uppercase transition-colors ${uploadMode === "single" ? (isDark ? "bg-[#d5ff38] text-black" : "bg-slate-900 text-white") : `${c.hover} ${c.textMuted}`}`}>
                      ◆ SINGLE IMAGE
                    </button>
                    <button onClick={() => { setUploadMode("batch"); setFile(null); setResult(null); }}
                      className={`px-3 py-1.5 uppercase flex items-center gap-1 transition-colors ${uploadMode === "batch" ? (isDark ? "bg-[#d5ff38] text-black" : "bg-slate-900 text-white") : `${c.hover} ${c.textMuted}`}`}>
                      <Images size={12} />
                      BATCH UPLOAD
                    </button>
                  </div>

                  {/* Sample chips */}
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}><Zap size={11} className="fill-current" />QUICK LOAD:</span>
                  {SAMPLE_DEFECTS.map((s) => (
                    <button key={s.name} onClick={() => loadPresetSample(s.file)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase border shrink-0 transition-colors flex items-center gap-1.5 ${c.line} ${c.hover} ${c.textPrimary}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-Scan */}
                  <button onClick={() => setAutoScanActive(!autoScanActive)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border flex items-center gap-1.5 transition-colors ${autoScanActive ? "bg-emerald-600 text-white border-emerald-600 animate-pulse" : `${c.line} ${c.hover} ${c.textPrimary}`}`}>
                    {autoScanActive ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
                    <span>{autoScanActive ? "STREAMING (ON)" : "AUTO-SCAN"}</span>
                  </button>

                  {/* View mode (single only) */}
                  {result && uploadMode === "single" && (
                    <div className={`flex items-center gap-1 border p-0.5 ${c.line}`}>
                      {[{mode:"split",label:"SPLIT"},{mode:"annotated",label:"BOXES"},{mode:"raw",label:"RAW"},{mode:"contrast",label:"FILTER"}].map((m) => (
                        <button key={m.mode} onClick={() => setViewMode(m.mode)}
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${viewMode === m.mode ? (isDark ? "bg-[#d5ff38] text-black" : "bg-slate-900 text-white") : `${c.textMuted} hover:opacity-100`}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Confidence slider */}
                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase">
                    <span className={c.textMuted}>CONF:</span>
                    <input type="range" min="5" max="90" value={confidenceFilter}
                      onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                      className="w-16 accent-emerald-500 cursor-pointer" />
                    <span className={`font-black ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>{confidenceFilter}%</span>
                  </div>
                </div>
              </div>

              {/* ─── SINGLE MODE ─── */}
              {uploadMode === "single" && (
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                  {/* Left — upload + controls */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className={`border ${c.line} ${c.surface} p-5`}>
                      <div className={`flex items-center justify-between pb-3 mb-4 border-b border-current/10`}>
                        <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}><Crosshair size={14} />SPECIMEN INPUT</span>
                        <span className={`text-[9px] uppercase tracking-wider ${c.textMuted}`}>SINGLE FILE</span>
                      </div>

                      {!file ? (
                        <label onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                          className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${dragging ? "border-emerald-500 bg-emerald-500/10" : `${c.line} hover:border-emerald-500 ${c.hover}`}`}>
                          <div className="w-10 h-10 bg-[#d5ff38] text-black font-black flex items-center justify-center mb-3"><ImagePlus size={18} /></div>
                          <p className={`text-xs font-black uppercase tracking-wider font-sans ${c.textPrimary}`}>DROP IMAGE HERE</p>
                          <p className={`text-[10px] mt-1.5 uppercase ${c.textMuted}`}>Or click · JPG / PNG / WEBP · max 10 MB</p>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSingleFileChange} />
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative aspect-[16/10] bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                            <img src={preview} alt="Specimen" className="max-h-full max-w-full object-contain" />
                            <button type="button" onClick={() => { setFile(null); setResult(null); setError(""); }}
                              className="absolute top-2 right-2 bg-black/80 text-white p-1.5 hover:bg-rose-600 transition-colors" title="Remove">
                              <X size={13} />
                            </button>
                            <div className={`absolute top-2 left-2 text-[8px] px-2 py-0.5 font-mono ${isDark ? "bg-black/80 text-[#d5ff38]" : "bg-white/90 text-emerald-800"} border border-white/10`}>STATUS: LOADED</div>
                          </div>
                          <p className={`text-[9px] truncate uppercase ${c.textMuted}`}>{file.name}</p>
                          <label className={`cursor-pointer inline-flex items-center gap-2 text-xs font-bold uppercase ${c.textMuted} hover:text-white`}>
                            <RefreshCw size={12} /><span>REPLACE</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleSingleFileChange} />
                          </label>
                        </div>
                      )}
                    </div>

                    {error && <div className={`p-4 border ${c.line} text-xs font-mono`}><span className="text-rose-500 font-bold uppercase">ERROR: </span><span className={c.textPrimary}>{error}</span></div>}

                    {/* Analyze Button */}
                    <button onClick={handleAnalyze} disabled={!file || loading}
                      className={`w-full py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors ${!file || loading ? "opacity-40 cursor-not-allowed bg-white/10" : c.accentButton} border ${!file || loading ? c.line : "border-transparent"}`}>
                      {loading ? <LoaderCircle size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                      {loading ? "SCANNING SURFACE..." : "EXECUTE OPTICAL RUN ⚡"}
                    </button>

                    {/* Verdict Banner */}
                    {result && !loading && (
                      <div className={`p-4 border ${currentVerdict.border} ${currentVerdict.bg} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${currentVerdict.colorText}`}>{currentVerdict.grade}</span>
                          <span className={`text-[9px] px-2 py-0.5 font-black uppercase ${currentVerdict.badge}`}>{currentVerdict.status}</span>
                        </div>
                        <p className={`text-xs font-bold uppercase ${currentVerdict.colorText}`}>{currentVerdict.title}</p>
                        <p className={`text-[10px] uppercase ${c.textMuted}`}>{currentVerdict.action}</p>
                        {result.latency_ms && <p className={`text-[9px] uppercase font-mono ${c.textMuted}`}>NEURAL LATENCY: {result.latency_ms.toFixed(1)} MS · MODEL: YOLO11-IMPROVED</p>}
                      </div>
                    )}

                    {/* Export */}
                    {result && !loading && (
                      <button onClick={exportCSV} className={`w-full py-2.5 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${c.line} ${c.hover} ${c.textPrimary}`}>
                        <FileSpreadsheet size={14} />EXPORT AUDIT CSV
                      </button>
                    )}
                  </div>

                  {/* Right — viewport */}
                  <div className="lg:col-span-8 space-y-6">
                    {!result && !loading && (
                      <div className={`aspect-video border-2 border-dashed ${c.line} flex flex-col items-center justify-center text-center ${c.surface}`}>
                        <Scan size={48} className={`${c.textMuted} mb-4`} />
                        <p className={`text-sm font-black uppercase ${c.textPrimary}`}>OPTICAL VIEWPORT IDLE</p>
                        <p className={`text-xs mt-2 uppercase ${c.textMuted}`}>Load a specimen and run inspection</p>
                      </div>
                    )}

                    {loading && (
                      <div className={`aspect-video border ${c.line} ${c.surface} flex flex-col items-center justify-center`}>
                        <LoaderCircle size={40} className="animate-spin text-[#d5ff38] mb-6" />
                        <p className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>NEURAL FORWARD PASS</p>
                        <h3 className={`text-2xl font-black uppercase font-sans mt-2 ${c.textPrimary}`}>SCANNING SURFACE…</h3>
                        <div className="w-48 bg-white/10 h-1 overflow-hidden mt-6"><div className="bg-[#d5ff38] h-full w-2/3 animate-pulse" /></div>
                      </div>
                    )}

                    {result && !loading && (
                      <div className="space-y-4">
                        {/* Split / Annotated / Raw */}
                        {viewMode === "split" && (
                          <div ref={sliderRef} className="relative aspect-video bg-black overflow-hidden cursor-col-resize border border-white/20"
                            onMouseMove={(e) => isDraggingSlider && handleSliderMove(e)}
                            onMouseUp={() => setIsDraggingSlider(false)}
                            onMouseLeave={() => setIsDraggingSlider(false)}
                            onTouchMove={handleSliderMove}
                            onTouchEnd={() => setIsDraggingSlider(false)}>
                            <img src={preview} alt="Raw" className="absolute inset-0 w-full h-full object-contain" />
                            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                              <img src={result.result_image_url} alt="Annotated" className="absolute inset-0 w-full h-full object-contain" />
                            </div>
                            <div className="absolute top-0 bottom-0 w-0.5 bg-[#d5ff38] shadow-xl" style={{ left: `${sliderPos}%` }}>
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-[#d5ff38] text-black flex items-center justify-center font-black text-sm cursor-grab shadow-xl"
                                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSlider(true); }}
                                onTouchStart={() => setIsDraggingSlider(true)}>⟺</div>
                            </div>
                            <div className="absolute top-3 left-3 text-[9px] font-black px-2 py-1 bg-black/80 text-white">RAW</div>
                            <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-1 bg-[#d5ff38] text-black">YOLO PREDICTION</div>
                          </div>
                        )}
                        {viewMode === "annotated" && <div className="aspect-video bg-black border border-white/20 overflow-hidden flex items-center justify-center"><img src={result.result_image_url} alt="Annotated" className="max-h-full max-w-full object-contain" /></div>}
                        {viewMode === "raw" && <div className="aspect-video bg-black border border-white/20 overflow-hidden flex items-center justify-center"><img src={preview} alt="Raw" className="max-h-full max-w-full object-contain" /></div>}
                        {viewMode === "contrast" && <div className="aspect-video bg-black border border-white/20 overflow-hidden flex items-center justify-center"><img src={result.result_image_url} alt="Contrast" className="max-h-full max-w-full object-contain filter contrast-150 brightness-110" /></div>}

                        {/* Detection Cards */}
                        {filteredDetections.length > 0 ? (
                          <div className="space-y-2">
                            <p className={`text-[10px] font-black uppercase tracking-wider ${c.textMuted}`}>{filteredDetections.length} DEFECT{filteredDetections.length !== 1 ? "S" : ""} DETECTED ABOVE {confidenceFilter}% CONFIDENCE</p>
                            {filteredDetections.map((d, i) => (
                              <div key={i} className={`border ${c.line} ${c.surface} p-3 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                  <span className="w-2 h-2 rounded-full bg-[#ff5436]" />
                                  <div>
                                    <p className={`text-xs font-black uppercase ${c.textPrimary}`}>{prettyName(d.defect)}</p>
                                    <p className={`text-[9px] font-mono ${c.textMuted}`}>[{d.box?.map((v) => v.toFixed(0)).join(", ")}]</p>
                                  </div>
                                </div>
                                <span className={`text-xs font-black font-mono ${confidencePercent(d.confidence) >= 85 ? "text-emerald-500" : "text-amber-500"}`}>{confidencePercent(d.confidence).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`p-6 text-center border border-dashed text-xs uppercase ${c.textMuted}`} style={{ borderColor: "currentColor" }}>
                            {result ? "NO DEFECTS ABOVE CONFIDENCE THRESHOLD" : "AWAITING INSPECTION RUN"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── BATCH MODE ─── */}
              {uploadMode === "batch" && (
                <div className="space-y-5">
                  {/* Drop Zone */}
                  <label onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                    className={`border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragging ? "border-emerald-500 bg-emerald-500/10" : `${c.line} hover:border-emerald-500 ${c.hover}`}`}>
                    <div className="w-12 h-12 bg-[#d5ff38] text-black font-black flex items-center justify-center mb-3"><Images size={22} /></div>
                    <p className={`text-sm font-black uppercase tracking-wider font-sans ${c.textPrimary}`}>DROP MULTIPLE IMAGES</p>
                    <p className={`text-[11px] mt-2 uppercase ${c.textMuted}`}>Or click to browse — JPG / PNG / WEBP · max 10 MB each</p>
                    <p className={`text-[10px] mt-1 ${c.textMuted}`}>Select as many files as you want</p>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleBatchFileChange} />
                  </label>

                  {/* File List */}
                  {batchFiles.length > 0 && (
                    <div className={`border ${c.line} ${c.surface} p-5 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>{batchFiles.length} FILES QUEUED</span>
                        <div className="flex gap-2">
                          <label className={`px-3 py-1 text-[10px] font-bold uppercase cursor-pointer border ${c.line} ${c.hover} ${c.textPrimary}`}>
                            + ADD MORE
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleBatchFileChange} />
                          </label>
                          <button onClick={() => { setBatchFiles([]); setBatchResults(null); }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase border text-rose-500 border-rose-500/30 hover:bg-rose-500/10`}>CLEAR ALL</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {batchFiles.map((f, i) => (
                          <div key={i} className={`relative border ${c.line} aspect-square flex flex-col items-center justify-center overflow-hidden group`}>
                            <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <p className="text-[8px] text-white font-mono text-center truncate w-full px-1">{f.name}</p>
                              <button onClick={() => setBatchFiles((p) => p.filter((_, j) => j !== i))}
                                className="w-6 h-6 bg-rose-600 text-white flex items-center justify-center text-xs">✕</button>
                            </div>
                            {/* Result overlay */}
                            {batchResults?.results?.[i] && (
                              <div className={`absolute bottom-0 left-0 right-0 text-[8px] font-black uppercase text-center py-0.5 ${batchResults.results[i].verdict === "PASS" ? "bg-emerald-600 text-white" : batchResults.results[i].verdict === "REJECT" ? "bg-rose-600 text-white" : "bg-amber-500 text-black"}`}>
                                {batchResults.results[i].verdict}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchError && <div className={`p-4 border ${c.line} text-xs font-mono`}><span className="text-rose-500 font-bold">ERROR: </span><span className={c.textPrimary}>{batchError}</span></div>}

                  {/* Run Button */}
                  <button onClick={handleBatchAnalyze} disabled={batchFiles.length === 0 || batchLoading}
                    className={`w-full py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors border ${batchFiles.length === 0 || batchLoading ? "opacity-40 cursor-not-allowed bg-white/10 " + c.line : c.accentButton + " border-transparent"}`}>
                    {batchLoading ? <LoaderCircle size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                    {batchLoading ? `SCANNING ${batchFiles.length} IMAGES…` : `RUN BATCH INSPECTION (${batchFiles.length} FILES) ⚡`}
                  </button>

                  {/* Batch Results */}
                  {batchResults && (
                    <div className="space-y-4">
                      {/* Summary Bar */}
                      <div className={`p-5 border ${c.line} ${c.surface} grid grid-cols-2 sm:grid-cols-4 gap-4`}>
                        <div><div className={`text-[10px] font-bold uppercase ${c.textMuted}`}>TOTAL FILES</div><div className={`text-2xl font-black mt-1 ${c.textPrimary}`}>{batchResults.total_files}</div></div>
                        <div><div className={`text-[10px] font-bold uppercase ${c.textMuted}`}>PASSED</div><div className="text-2xl font-black mt-1 text-emerald-500">{batchResults.passed_count}</div></div>
                        <div><div className={`text-[10px] font-bold uppercase ${c.textMuted}`}>REJECTED</div><div className="text-2xl font-black mt-1 text-rose-500">{batchResults.rejected_count}</div></div>
                        <div><div className={`text-[10px] font-bold uppercase ${c.textMuted}`}>SUCCESS RATE</div><div className={`text-2xl font-black mt-1 ${batchResults.success_rate >= 90 ? "text-emerald-500" : "text-amber-500"}`}>{batchResults.success_rate}%</div></div>
                      </div>

                      {/* Per-image results */}
                      <div className="space-y-2">
                        {batchResults.results.map((r, i) => (
                          <div key={i} className={`border ${c.line} ${c.surface} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                            <div className="flex items-center gap-3">
                              {r.result_image_url && <img src={r.result_image_url} alt="" className="w-16 h-12 object-cover border border-white/10" />}
                              <div>
                                <p className={`text-xs font-black uppercase ${c.textPrimary}`}>{r.filename}</p>
                                <p className={`text-[10px] font-mono ${c.textMuted}`}>{r.count} defect{r.count !== 1 ? "s" : ""} · {r.latency_ms?.toFixed(1)} ms · {r.grade}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {r.detections?.slice(0, 3).map((d, j) => (
                                <span key={j} className={`text-[9px] px-2 py-0.5 border ${c.line} font-bold uppercase ${c.textSecondary}`}>{prettyName(d.defect)}</span>
                              ))}
                              <span className={`text-xs px-3 py-1 font-black uppercase ${r.verdict === "PASS" ? "bg-emerald-600 text-white" : r.verdict === "REJECT" ? "bg-rose-600 text-white" : "bg-amber-500 text-black"}`}>{r.verdict}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={exportCSV} className={`w-full py-2.5 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${c.line} ${c.hover} ${c.textPrimary}`}>
                        <FileSpreadsheet size={14} />EXPORT FULL AUDIT CSV
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: BATCH QUEUE ═══════════ */}
          {activeTab === "queue" && (
            <div className="space-y-5">
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>BATCH QUEUE & PENDING TASKS</h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>{pendingTasks.filter((t) => t.status !== "COMPLETED").length} tasks awaiting inspection</p>
                </div>
                <button onClick={simulateProcessBatch} disabled={isProcessingQueue}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border ${c.accentButton} border-transparent ${isProcessingQueue ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isProcessingQueue ? <LoaderCircle size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                  RUN ENTIRE BATCH
                </button>
              </div>

              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className={`border ${c.line} ${c.surface} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${task.priority === "CRITICAL" ? "bg-rose-600 text-white" : task.priority === "HIGH" ? "bg-amber-500 text-black" : "bg-white/10 text-white"}`}>{task.priority}</span>
                        <span className={`text-xs font-black uppercase ${c.textPrimary}`}>{task.id}</span>
                        <span className={`text-[10px] font-mono ${c.textMuted}`}>{task.coilId}</span>
                      </div>
                      <p className={`text-[10px] uppercase ${c.textMuted}`}>{task.line} · Heat: {task.heatNumber} · {task.time}</p>
                      {task.progress > 0 && task.progress < 100 && (
                        <div className="w-full bg-white/10 h-1 mt-2"><div className="bg-[#d5ff38] h-full" style={{ width: `${task.progress}%` }} /></div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2 py-0.5 font-bold uppercase ${task.status === "COMPLETED" ? "text-emerald-500 border border-emerald-500/30" : task.status === "PROCESSING" ? "text-amber-500 border border-amber-500/30" : `${c.textMuted} border ${c.line}`}`}>{task.status}</span>
                      {task.status !== "COMPLETED" && (
                        <button onClick={() => runQueueTask(task)} className={`px-3 py-1.5 text-[10px] font-black uppercase border ${c.accentButton} border-transparent flex items-center gap-1`}>
                          <Scan size={11} />INSPECT NOW ↗
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ TAB: AUDIT HISTORY ═══════════ */}
          {activeTab === "history" && (
            <div className="space-y-5">
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>COMPLETED AUDIT TRAIL</h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>{completedTasks.length} inspection records</p>
                </div>
                <button onClick={exportCSV} className={`px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 border ${c.accentButton} border-transparent`}>
                  <FileSpreadsheet size={14} />EXPORT CSV
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className={`flex items-center gap-2 border ${c.line} ${c.surface} px-3 flex-1`}>
                  <Search size={14} className={c.textMuted} />
                  <input type="text" placeholder="Search coil, specimen, defect…" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}
                    className={`flex-1 py-2.5 text-xs uppercase bg-transparent outline-none ${c.textPrimary} placeholder:${c.textMuted}`} />
                </div>
                <div className={`flex border ${c.line} text-[10px] font-bold`}>
                  {["ALL","PASS","WARNING","REJECT"].map((f) => (
                    <button key={f} onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-2 uppercase transition-colors ${historyFilter === f ? (isDark ? "bg-[#d5ff38] text-black" : "bg-slate-900 text-white") : `${c.hover} ${c.textMuted}`}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {displayedCompleted.map((t) => (
                  <div key={t.id} className={`border ${c.line} ${c.surface} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`font-black uppercase ${c.textPrimary}`}>{t.id}</span>
                        <span className={`font-mono ${c.textMuted}`}>{t.coilId}</span>
                        <span className={`font-mono text-[9px] ${c.textMuted}`}>{t.time}</span>
                      </div>
                      <p className={`text-[10px] ${c.textMuted} uppercase`}>{t.specimen} · {t.defectCount} defect{t.defectCount !== 1 ? "s" : ""} · Primary: {prettyName(t.primaryDefect)} · Conf: {t.confidence} · {t.latency || "—"}</p>
                      <p className={`text-[9px] ${c.textMuted} uppercase`}>Operator: {t.operator} · {t.grade}</p>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 font-black uppercase ${t.verdict === "PASS" ? "bg-emerald-600 text-white" : t.verdict === "REJECT" ? "bg-rose-600 text-white" : "bg-amber-500 text-black"}`}>{t.verdict}</span>
                  </div>
                ))}
                {displayedCompleted.length === 0 && (
                  <div className={`p-8 text-center text-xs uppercase ${c.textMuted}`}>No records match current filter.</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ TAB: MODEL BENCHMARKS ═══════════ */}
          {activeTab === "benchmarks" && (
            <div className="space-y-6">
              <div className={`p-5 border ${c.line} ${c.surface}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>NEU-DET MODEL BENCHMARKS</h2>
                <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>Active weights: neu_det_improved / YOLO11 Architecture</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "mAP@50",     value: "67.7%", note: "vs 85% target",  color: "text-amber-500" },
                  { label: "Precision",  value: "61.5%", note: "all 6 classes",  color: "text-[#d5ff38]" },
                  { label: "Recall",     value: "66.4%", note: "30 epoch run",   color: "text-sky-400"   },
                  { label: "mAP@50-95", value: "34.4%", note: "multi-IoU",      color: "text-purple-400"},
                ].map((m) => (
                  <div key={m.label} className={`p-5 border ${c.line} ${c.surface}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>{m.label}</div>
                    <div className={`text-3xl font-black font-sans mt-1 ${m.color}`}>{m.value}</div>
                    <div className={`text-[10px] mt-1 uppercase ${c.textMuted}`}>{m.note}</div>
                  </div>
                ))}
              </div>
              <div className={`p-6 border ${c.line} ${c.surface} space-y-3`}>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${c.textPrimary}`}>TRAINING CONFIGURATION</h3>
                {[
                  ["Architecture",  "YOLOv11 Nano (yolo11n.pt)"],
                  ["Training Data", "NEU-DET · 1,799 Images · 6 Classes"],
                  ["Epochs",        "30 (CPU training — ~9.6 hrs)"],
                  ["Image Size",    "320×320"],
                  ["Optimizer",     "AdamW · lr=0.001 · wd=0.0005"],
                  ["Device",        "CPU (No NVIDIA GPU detected)"],
                  ["Model Path",    "outputs/training/neu_det_improved/weights/best.pt"],
                  ["Backend Status",backendStatus === "online" ? "✓ Online & Healthy" : "✗ Offline"],
                ].map(([k, v]) => (
                  <div key={k} className={`flex gap-4 text-xs border-b pb-2 ${c.line}`}>
                    <span className={`font-bold uppercase w-36 shrink-0 ${c.textMuted}`}>{k}</span>
                    <span className={c.textPrimary}>{v}</span>
                  </div>
                ))}
              </div>
              <div className={`p-5 border border-amber-500/30 bg-amber-500/5 text-xs`}>
                <p className={`font-black uppercase text-amber-500 mb-1`}>⚡ UPGRADE PATH: 85%+ mAP</p>
                <p className={c.textMuted}>Train YOLO11s/m on Google Colab free T4 GPU · 80 epochs · imgsz=640 · Cosine LR · CLAHE augmentation → ~15 mins vs 9+ hrs on CPU.</p>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: OPERATOR PROFILE ═══════════ */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Header */}
              <div className={`p-6 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-5`}>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#d5ff38] text-black font-black text-2xl flex items-center justify-center rounded-none font-sans">
                    {profile.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className={`text-xl font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>{profile.name}</h2>
                    <p className={`text-xs uppercase mt-0.5 ${isDark ? "text-[#d5ff38]" : "text-emerald-700"} font-bold`}>{profile.role}</p>
                    <p className={`text-[10px] uppercase mt-0.5 ${c.textMuted}`}>{profile.plant} · {profile.shift}</p>
                  </div>
                </div>
                <button onClick={() => { setProfileDraft({ ...profile }); setProfileEditing(!profileEditing); }}
                  className={`px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 border ${profileEditing ? `border-rose-500/50 text-rose-500 ${c.hover}` : c.accentButton + " border-transparent"}`}>
                  {profileEditing ? <><X size={14} />CANCEL</> : <><Settings size={14} />EDIT PROFILE</>}
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "SESSION INSPECTIONS", value: completedTasks.length.toLocaleString() },
                  { label: "AVG INFERENCE",       value: avgLatency === null ? "—" : `${avgLatency.toFixed(1)} ms` },
                  { label: "EMPLOYEE ID",         value: profile.employeeId },
                ].map((s) => (
                  <div key={s.label} className={`p-5 border ${c.line} ${c.surface} text-center`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>{s.label}</div>
                    <div className={`text-2xl font-black font-sans mt-1 ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Profile Fields */}
              {profileEditing ? (
                <div className={`p-6 border ${c.line} ${c.surface} space-y-4`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${c.textPrimary}`}>EDIT OPERATOR PROFILE</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "name",        label: "Full Name" },
                      { key: "role",        label: "Role / Title" },
                      { key: "email",       label: "Email Address" },
                      { key: "plant",       label: "Plant / Facility" },
                      { key: "department",  label: "Department" },
                      { key: "shift",       label: "Shift Assignment" },
                      { key: "certifications", label: "Certifications" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>{label}</label>
                        <input type="text" value={profileDraft[key] || ""}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, [key]: e.target.value }))}
                          className={`w-full px-3 py-2.5 text-xs border outline-none transition-colors ${c.input}`} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${c.textMuted}`}>NOTIFICATION PREFERENCES</p>
                    {[
                      { key: "notifEmail",    label: "Email digest on shift end" },
                      { key: "notifCritical", label: "Alert on GRADE C (REJECT)" },
                      { key: "notifBatch",    label: "Batch completion notification" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!profileDraft[key]}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, [key]: e.target.checked }))}
                          className="w-4 h-4 accent-emerald-500" />
                        <span className={`text-xs uppercase font-bold ${c.textPrimary}`}>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={saveProfileEdits} className={`px-6 py-2.5 text-xs font-black uppercase flex items-center gap-2 border ${c.accentButton} border-transparent`}>
                      <Check size={14} />SAVE CHANGES
                    </button>
                    <button onClick={() => setProfileEditing(false)} className={`px-6 py-2.5 text-xs font-bold uppercase border ${c.line} ${c.hover} ${c.textMuted}`}>
                      DISCARD
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-6 border ${c.line} ${c.surface} grid sm:grid-cols-2 gap-4 text-xs`}>
                  {[
                    ["Email",            profile.email],
                    ["Department",       profile.department],
                    ["Plant",            profile.plant],
                    ["Shift",            profile.shift],
                    ["Join Date",        profile.joinDate],
                    ["Certifications",   profile.certifications],
                    ["Email Digest",     profile.notifEmail ? "Enabled" : "Disabled"],
                    ["Reject Alerts",    profile.notifCritical ? "Enabled" : "Disabled"],
                  ].map(([k, v]) => (
                    <div key={k} className={`flex flex-col gap-0.5 border-b pb-3 ${c.line}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>{k}</span>
                      <span className={`font-bold ${c.textPrimary}`}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}