import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Cpu,
  Crosshair,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  FolderOpen,
  Gauge,
  History,
  ImagePlus,
  Layers,
  LineChart,
  ListTodo,
  LoaderCircle,
  Maximize2,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Percent,
  Play,
  RefreshCw,
  RotateCcw,
  Scan,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Target,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { inspectImage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DEFECTS = [
  "crazing",
  "inclusion",
  "patches",
  "pitted_surface",
  "rolled-in_scale",
  "scratches",
];

const SAMPLE_DEFECTS = [
  { name: "Crazing", file: "crazing_241.jpg", code: "01", color: "#ff5436" },
  { name: "Inclusion", file: "inclusion_241.jpg", code: "02", color: "#ff5436" },
  { name: "Patches", file: "patches_241.jpg", code: "03", color: "#eab308" },
  { name: "Pitted", file: "pitted_surface_241.jpg", code: "04", color: "#0284c7" },
  { name: "Scale", file: "rolled-in_scale_241.jpg", code: "05", color: "#9333ea" },
  { name: "Scratches", file: "scratches_241.jpg", code: "06", color: "#16a34a" },
];

const INITIAL_QUEUE = [
  {
    id: "TASK-8841",
    coilId: "COIL-HT-902",
    line: "Roughing Stand 02",
    sample: "crazing_241.jpg",
    status: "PROCESSING",
    progress: 72,
    priority: "HIGH",
    time: "12:02 PM",
    heatNumber: "H-44910",
  },
  {
    id: "TASK-8842",
    coilId: "COIL-HT-903",
    line: "Continuous Mill 04",
    sample: "inclusion_241.jpg",
    status: "PENDING",
    progress: 0,
    priority: "CRITICAL",
    time: "12:05 PM",
    heatNumber: "H-44911",
  },
  {
    id: "TASK-8843",
    coilId: "COIL-CL-311",
    line: "Cold Finishing Stand",
    sample: "patches_241.jpg",
    status: "PENDING",
    progress: 0,
    priority: "NORMAL",
    time: "12:08 PM",
    heatNumber: "H-44912",
  },
  {
    id: "TASK-8844",
    coilId: "COIL-CL-312",
    line: "Pickling Entry Gate",
    sample: "scratches_241.jpg",
    status: "QUEUED",
    progress: 0,
    priority: "NORMAL",
    time: "12:10 PM",
    heatNumber: "H-44913",
  },
];

const INITIAL_COMPLETED = [
  {
    id: "COMP-771",
    coilId: "COIL-HT-899",
    specimen: "crazing_241.jpg",
    time: "11:52 AM",
    defectCount: 3,
    primaryDefect: "crazing",
    confidence: "94.2%",
    verdict: "REJECT",
    grade: "GRADE C",
    operator: "Alex Mercer",
  },
  {
    id: "COMP-770",
    coilId: "COIL-HT-898",
    specimen: "inclusion_241.jpg",
    time: "11:45 AM",
    defectCount: 2,
    primaryDefect: "inclusion",
    confidence: "96.4%",
    verdict: "REJECT",
    grade: "GRADE C",
    operator: "Alex Mercer",
  },
  {
    id: "COMP-769",
    coilId: "COIL-CL-308",
    specimen: "patches_241.jpg",
    time: "11:34 AM",
    defectCount: 1,
    primaryDefect: "patches",
    confidence: "93.0%",
    verdict: "WARNING",
    grade: "GRADE B",
    operator: "Alex Mercer",
  },
  {
    id: "COMP-768",
    coilId: "COIL-CL-307",
    specimen: "scratches_241.jpg",
    time: "11:18 AM",
    defectCount: 2,
    primaryDefect: "scratches",
    confidence: "97.2%",
    verdict: "WARNING",
    grade: "GRADE B",
    operator: "Sarah Chen",
  },
  {
    id: "COMP-767",
    coilId: "COIL-HT-895",
    specimen: "clean_strip_102.jpg",
    time: "11:05 AM",
    defectCount: 0,
    primaryDefect: "none",
    confidence: "99.8%",
    verdict: "PASS",
    grade: "GRADE A",
    operator: "Sarah Chen",
  },
  {
    id: "COMP-766",
    coilId: "COIL-HT-894",
    specimen: "pitted_surface_241.jpg",
    time: "10:50 AM",
    defectCount: 1,
    primaryDefect: "pitted_surface",
    confidence: "95.5%",
    verdict: "REJECT",
    grade: "GRADE C",
    operator: "Sarah Chen",
  },
];

// Production Trend Days (7-Day Throughput)
const TREND_DAYS = [
  { day: "MON", total: 210, passed: 198, failed: 12, rate: 94.3 },
  { day: "TUE", total: 245, passed: 232, failed: 13, rate: 94.7 },
  { day: "WED", total: 260, passed: 251, failed: 9, rate: 96.5 },
  { day: "THU", total: 230, passed: 218, failed: 12, rate: 94.8 },
  { day: "FRI", total: 280, passed: 263, failed: 17, rate: 93.9 },
  { day: "SAT", total: 190, passed: 181, failed: 9, rate: 95.2 },
  { day: "SUN", total: 142, passed: 135, failed: 7, rate: 95.1 },
];

function prettyName(name = "") {
  return name.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function confidencePercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number <= 1 ? number * 100 : number));
}

function calculateVerdict(detections) {
  if (!detections || detections.length === 0) {
    return {
      grade: "GRADE A",
      status: "PASS",
      title: "100% CLEARANCE // ZERO DEFECTS DETECTED",
      colorText: "text-emerald-600 dark:text-[#d5ff38]",
      border: "border-emerald-500/30 dark:border-[#d5ff38]/40",
      bg: "bg-emerald-500/10 dark:bg-[#d5ff38]/10",
      badge: "bg-emerald-600 text-white dark:bg-[#d5ff38] dark:text-black",
      action: "Coil passed metallurgical standards. Dispatched to automated strapping.",
    };
  }

  const hasCritical = detections.some(
    (d) => d.defect === "inclusion" || d.defect === "crazing"
  );

  if (hasCritical || detections.length >= 3) {
    return {
      grade: "GRADE C",
      status: "REJECT",
      title: "REJECT // CRITICAL DEFECT ISOLATED",
      colorText: "text-rose-600 dark:text-[#ff5436]",
      border: "border-rose-500/30 dark:border-[#ff5436]/40",
      bg: "bg-rose-500/10 dark:bg-[#ff5436]/10",
      badge: "bg-rose-600 text-white dark:bg-[#ff5436] dark:text-black",
      action: "Coil marked with orange dye. Automated re-mill diversion executed.",
    };
  }

  return {
    grade: "GRADE B",
    status: "WARNING",
    title: "CONDITION B // SECONDARY SURFACE REVIEW",
    colorText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30 dark:border-amber-400/40",
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    badge: "bg-amber-500 text-white dark:bg-amber-400 dark:text-black",
    action: "Surface marks within tolerance limits. Routed to finishing stand for mechanical grinding.",
  };
}

export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme();

  // Navigation & Layout
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "inspector" | "queue" | "history" | "benchmarks"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Inspector State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Viewer Controls
  const [viewMode, setViewMode] = useState("split");
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState(15);
  const [selectedDetection, setSelectedDetection] = useState(null);

  // Auto-Scan Live Simulation Mode
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [autoScanIndex, setAutoScanIndex] = useState(0);

  // Task & Queue State
  const [pendingTasks, setPendingTasks] = useState(INITIAL_QUEUE);
  const [completedTasks, setCompletedTasks] = useState(INITIAL_COMPLETED);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("ALL");

  const sliderRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Auto-Scan Simulation Loop
  useEffect(() => {
    let timer;
    if (autoScanActive) {
      timer = setInterval(() => {
        const nextIdx = (autoScanIndex + 1) % SAMPLE_DEFECTS.length;
        setAutoScanIndex(nextIdx);
        loadPresetSample(SAMPLE_DEFECTS[nextIdx].file);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [autoScanActive, autoScanIndex]);

  // High-Contrast Theme Palette
  const c = isDark
    ? {
        bg: "bg-[#0b0c08] text-[#f5f4ed]",
        surface: "bg-[#141510]",
        surfaceRaised: "bg-[#1c1d16]",
        line: "border-[#25271d]",
        lineLight: "border-[#323528]",
        textPrimary: "text-[#f5f4ed]",
        textSecondary: "text-[#9ca3af]",
        textMuted: "text-[#6b7280]",
        accent: "bg-[#d5ff38] text-black",
        accentText: "text-[#d5ff38]",
        accentBorder: "border-[#d5ff38]",
        signalText: "text-[#ff5436]",
        hover: "hover:bg-white/5",
        activeItem: "bg-[#d5ff38]/15 border-l-2 border-[#d5ff38] text-[#d5ff38] font-bold",
      }
    : {
        bg: "bg-[#f8f7f2] text-[#0f172a]",
        surface: "bg-[#ffffff]",
        surfaceRaised: "bg-[#f1efe6]",
        line: "border-[#e2dfd4]",
        lineLight: "border-[#cfccc0]",
        textPrimary: "text-[#0f172a]",
        textSecondary: "text-[#475569]",
        textMuted: "text-[#64748b]",
        accent: "bg-[#d5ff38] text-black border border-black/10",
        accentText: "text-[#365314]", // Deep Olive for ultra-clear contrast in light mode!
        accentBorder: "border-[#4d7c0f]",
        signalText: "text-[#dc2626]",
        hover: "hover:bg-black/5",
        activeItem: "bg-[#d5ff38]/30 border-l-2 border-[#4d7c0f] text-[#1e3a8a] dark:text-[#d5ff38] font-black",
      };

  function acceptFile(selected) {
    if (!selected) return;
    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setError("Please select a JPG or PNG image file.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("Image size must be 10 MB or less.");
      return;
    }
    setFile(selected);
    setResult(null);
    setError("");
    setSelectedDetection(null);
  }

  function handleFileChange(event) {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  async function loadPresetSample(sampleFileName) {
    try {
      const response = await fetch(`/samples/${sampleFileName}`);
      if (!response.ok) throw new Error("Could not load sample file.");
      const blob = await response.blob();
      const sampleFile = new File([blob], sampleFileName, { type: "image/jpeg" });
      acceptFile(sampleFile);
    } catch (err) {
      setError("Failed to load preset sample image.");
    }
  }

  async function handleAnalyze() {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedDetection(null);

    try {
      const data = await inspectImage(file);
      setResult(data);

      const verdictData = calculateVerdict(data.detections);
      const newRecord = {
        id: `COMP-${Math.floor(772 + Math.random() * 200)}`,
        coilId: `COIL-HT-${Math.floor(900 + Math.random() * 100)}`,
        specimen: file.name,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        defectCount: data.count || data.detections?.length || 0,
        primaryDefect: data.detections?.[0]?.defect || "none",
        confidence: data.detections?.[0]
          ? `${(data.detections[0].confidence * 100).toFixed(1)}%`
          : "99.8%",
        verdict: verdictData.status,
        grade: verdictData.grade,
        operator: "Alex Mercer",
      };

      setCompletedTasks((prev) => [newRecord, ...prev]);
    } catch (err) {
      setError(
        err.message ||
          "Could not reach prediction API on port 8000. Verify the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSliderMove(e) {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSliderPos((x / rect.width) * 100);
  }

  function runQueueTask(task) {
    loadPresetSample(task.sample);
    setActiveTab("inspector");
  }

  function simulateProcessBatch() {
    setIsProcessingQueue(true);
    setTimeout(() => {
      setPendingTasks((prev) =>
        prev.map((t) => ({ ...t, status: "COMPLETED", progress: 100 }))
      );
      setIsProcessingQueue(false);
    }, 1800);
  }

  function exportCSV() {
    const rows = [
      ["TASK_ID", "COIL_ID", "SPECIMEN", "TIMESTAMP", "DEFECTS", "PRIMARY_CLASS", "CONFIDENCE", "GRADE", "VERDICT", "OPERATOR"],
      ...completedTasks.map((t) => [
        t.id,
        t.coilId,
        t.specimen,
        t.time,
        t.defectCount,
        t.primaryDefect,
        t.confidence,
        t.grade,
        t.verdict,
        t.operator,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `defect_inspection_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const rawDetections = result?.detections || [];
  const filteredDetections = rawDetections.filter(
    (d) => confidencePercent(d.confidence) >= confidenceFilter
  );
  const uniqueClasses = new Set(filteredDetections.map((item) => item.defect)).size;
  const currentVerdict = calculateVerdict(filteredDetections);

  // Filtered Completed Tasks
  const displayedCompleted = completedTasks.filter((task) => {
    const matchesSearch =
      task.coilId.toLowerCase().includes(historySearch.toLowerCase()) ||
      task.specimen.toLowerCase().includes(historySearch.toLowerCase()) ||
      task.primaryDefect.toLowerCase().includes(historySearch.toLowerCase());
    const matchesFilter =
      historyFilter === "ALL" || task.verdict === historyFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen flex flex-col font-mono selection:bg-[#d5ff38] selection:text-black transition-colors duration-200 ${c.bg}`}>
      {/* ================= 1. DEDICATED APP TOPBAR ================= */}
      <header className={`border-b ${c.line} ${c.surface} sticky top-0 z-50 text-xs select-none h-14 flex items-stretch justify-between`}>
        {/* Left: Brand & Sidebar Collapse Toggle */}
        <div className="flex items-stretch">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`px-4 border-r ${c.line} ${c.hover} flex items-center justify-center`}
            title="Toggle Sidebar Navigation"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} className={isDark ? "text-[#d5ff38]" : "text-slate-800"} />
            ) : (
              <PanelLeftClose size={18} className={isDark ? "text-[#d5ff38]" : "text-slate-800"} />
            )}
          </button>

          <Link
            to="/"
            className={`flex items-center gap-3 px-4 sm:px-6 border-r ${c.line} ${c.hover} group`}
            title="Back to Landing Page"
          >
            <div className="w-8 h-8 bg-[#d5ff38] text-black font-black flex items-center justify-center text-sm group-hover:rotate-90 transition-transform">
              <ScanLine size={18} strokeWidth={2.4} />
            </div>
            <div>
              <span className={`font-black text-sm uppercase tracking-tight font-sans block leading-none ${c.textPrimary}`}>
                DEFECTVISION<span className={c.signalText}>.</span>
              </span>
              <span className={`text-[8px] tracking-[0.2em] uppercase block mt-0.5 ${c.textMuted}`}>
                QA STUDIO WORKBENCH
              </span>
            </div>
          </Link>

          {/* Active View Title */}
          <div className="hidden lg:flex items-center gap-3 px-6 text-[11px] font-bold uppercase tracking-wider">
            <span className={c.textMuted}>WORKSPACE //</span>
            <span className={`${isDark ? "text-[#d5ff38]" : "text-slate-900"} font-black`}>
              {activeTab === "analytics" && "SUCCESS RATE & QUALITY YIELD INTELLIGENCE"}
              {activeTab === "inspector" && "LIVE SPECIMEN INSPECTOR"}
              {activeTab === "queue" && "BATCH QUEUE & PENDING TASKS"}
              {activeTab === "history" && "AUDIT TRAIL & COMPLETED RUNS"}
              {activeTab === "benchmarks" && "NEU-DET MODEL BENCHMARKS"}
            </span>
          </div>
        </div>

        {/* Center: Live Telemetry Numbers */}
        <div className="hidden xl:flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={c.textPrimary}>STAND 04B: 12.4 M/S</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className={isDark ? "text-[#d5ff38]" : "text-emerald-800"}>SUCCESS RATE:</span>
            <span className="font-black text-emerald-500">94.8%</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border ${c.line} ${c.surfaceRaised}`}>
            <span className={c.textMuted}>INSPECTED TODAY:</span>
            <span className={c.textPrimary}>1,428 COILS</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-stretch">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 border-l text-[11px] font-bold uppercase tracking-wider ${c.line} ${c.hover} ${c.textSecondary}`}
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">EXIT STUDIO</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 border-l text-[11px] font-black uppercase tracking-wider transition-colors ${c.line} ${c.hover}`}
            title="Toggle Dark / Light theme"
          >
            {isDark ? (
              <>
                <Sun size={15} className="text-[#d5ff38]" />
                <span className="hidden sm:inline text-white">LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-slate-900" />
                <span className="hidden sm:inline text-slate-900">DARK</span>
              </>
            )}
          </button>

          {/* Operator Profile Chip */}
          <div className={`hidden sm:flex items-center gap-2.5 px-5 border-l text-[10px] font-bold uppercase tracking-wider ${c.line} ${c.surfaceRaised}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className={c.textPrimary}>ALEX M. [ QA LEAD ]</span>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN APP LAYOUT (SIDEBAR + CONTENT) ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= ADVANCED INDUSTRIAL SIDEBAR ================= */}
        <aside
          className={`border-r ${c.line} ${c.surface} flex flex-col justify-between transition-all duration-200 select-none shrink-0 ${
            sidebarCollapsed ? "w-16" : "w-64 sm:w-72"
          }`}
        >
          {/* Top Nav Items */}
          <div className="p-3 space-y-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <div className={`px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] ${c.textMuted}`}>
                CONTROL CHANNELS
              </div>
            )}

            {[
              {
                id: "analytics",
                label: "SUCCESS RATE & YIELD",
                badge: "94.8% PASS",
                badgeColor: "bg-emerald-600 text-white dark:bg-[#d5ff38] dark:text-black",
                icon: <BarChart3 size={18} strokeWidth={2} />,
              },
              {
                id: "inspector",
                label: "LIVE INSPECTOR",
                badge: "STUDIO",
                icon: <Crosshair size={18} strokeWidth={2} />,
              },
              {
                id: "queue",
                label: "BATCH QUEUE",
                badge: `${pendingTasks.filter((t) => t.status !== "COMPLETED").length} PENDING`,
                badgeColor: "bg-amber-500 text-black",
                icon: <ListTodo size={18} strokeWidth={2} />,
              },
              {
                id: "history",
                label: "COMPLETED AUDIT",
                badge: `${completedTasks.length} RUNS`,
                icon: <History size={18} strokeWidth={2} />,
              },
              {
                id: "benchmarks",
                label: "MODEL BENCHMARKS",
                badge: "85.4% mAP",
                icon: <Cpu size={18} strokeWidth={2} />,
              },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 text-xs tracking-wider uppercase transition-colors rounded-none ${
                    active ? c.activeItem : `${c.hover} ${c.textSecondary}`
                  }`}
                  title={tab.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={active ? (isDark ? "text-[#d5ff38]" : "text-emerald-800") : c.textMuted}>
                      {tab.icon}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="font-bold truncate text-[11px]">{tab.label}</span>
                    )}
                  </div>

                  {!sidebarCollapsed && tab.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded-sm ${
                        tab.badgeColor || (isDark ? "bg-white/10 text-white" : "bg-black/10 text-black")
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Diagnostics Strip */}
          <div className={`p-4 border-t ${c.line} ${c.surfaceRaised} text-[10px]`}>
            {!sidebarCollapsed ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>SUCCESS RATE:</span>
                  <span className="font-black text-emerald-500">94.8% [+1.4%]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>INSPECTION SPEED:</span>
                  <span className={`font-bold ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>
                    18.4 MS / FRAME
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={c.textMuted}>STAND SPEED:</span>
                  <span className={`font-bold ${c.textPrimary}`}>60 FPS // 12.4 M/S</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center" title="Armed & Online">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </aside>

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {/* ================= TAB 1: LIVE INSPECTOR ================= */}
          {activeTab === "inspector" && (
            <div className="space-y-6">
              {/* Presets & Auto-Scan Stream Bar */}
              <div className={`p-3 border ${c.line} ${c.surface} flex flex-wrap items-center justify-between gap-3 text-xs`}>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shrink-0 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>
                    <Zap size={13} className="fill-current" />
                    <span>QUICK SPECIMENS:</span>
                  </span>

                  {SAMPLE_DEFECTS.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => loadPresetSample(sample.file)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border shrink-0 transition-colors flex items-center gap-1.5 ${c.line} ${c.hover} ${c.textPrimary}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sample.color }} />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-Scan Live Stream Toggle */}
                  <button
                    onClick={() => setAutoScanActive(!autoScanActive)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors ${
                      autoScanActive
                        ? "bg-emerald-600 text-white border-emerald-600 animate-pulse"
                        : `${c.line} ${c.hover} ${c.textPrimary}`
                    }`}
                  >
                    {autoScanActive ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
                    <span>{autoScanActive ? "AUTO-STREAMING (ON)" : "AUTO-SCAN STREAM"}</span>
                  </button>

                  {result && (
                    <div className={`flex items-center gap-1 border p-0.5 ${c.line}`}>
                      {[
                        { mode: "split", label: "SPLIT SLIDER" },
                        { mode: "annotated", label: "BOXES" },
                        { mode: "raw", label: "RAW" },
                        { mode: "contrast", label: "FILTER" },
                      ].map((m) => (
                        <button
                          key={m.mode}
                          onClick={() => setViewMode(m.mode)}
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
                            viewMode === m.mode
                              ? isDark
                                ? "bg-[#d5ff38] text-black font-black"
                                : "bg-slate-900 text-white font-black"
                              : `${c.textMuted} hover:opacity-100`
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase">
                    <span className={c.textMuted}>CONFIDENCE:</span>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={confidenceFilter}
                      onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                      className="w-16 accent-emerald-500 cursor-pointer"
                    />
                    <span className={`font-black ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>
                      {confidenceFilter}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Core 2-Column Inspector Grid */}
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Left Upload & Actions */}
                <div className="lg:col-span-4 space-y-5">
                  <div className={`border ${c.line} ${c.surface} p-5`}>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: c.line }}>
                      <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>
                        <Crosshair size={14} />
                        <span>SPECIMEN INPUT</span>
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider ${c.textMuted}`}>
                        STAND 04B
                      </span>
                    </div>

                    {!file ? (
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${
                          dragging
                            ? "border-emerald-500 bg-emerald-500/10"
                            : `${c.line} hover:border-emerald-500 ${c.hover}`
                        }`}
                      >
                        <div className="w-10 h-10 bg-[#d5ff38] text-black font-black flex items-center justify-center mb-3">
                          <ImagePlus size={18} strokeWidth={2.2} />
                        </div>
                        <p className={`text-xs font-black uppercase tracking-wider font-sans ${c.textPrimary}`}>
                          DROP SPECIMEN IMAGE
                        </p>
                        <p className={`text-[10px] mt-1.5 uppercase ${c.textMuted}`}>
                          Or click to browse (JPG/PNG &lt; 10MB)
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative aspect-[16/10] bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                          <img
                            src={preview}
                            alt="Selected"
                            className="max-h-full max-w-full object-contain filter contrast-110"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setResult(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/80 text-white/70 hover:text-red-400 border border-white/20"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`truncate font-bold uppercase ${c.textPrimary}`}>{file.name}</span>
                          <span className={c.textMuted}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-3 p-3 border text-xs font-mono uppercase bg-red-500/10 text-red-500 border-red-500/30">
                        {error}
                      </div>
                    )}

                    {/* Execute Button */}
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={!file || loading}
                      className={`mt-4 w-full py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        !file || loading
                          ? "bg-black/10 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed border"
                          : "bg-[#d5ff38] text-black hover:bg-[#c2ed20] shadow-xl hover:-translate-y-0.5 border border-black/10"
                      }`}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle size={16} className="animate-spin" />
                          <span>RUNNING YOLO INFERENCE...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={15} />
                          <span>EXECUTE OPTICAL RUN</span>
                          <ArrowUpRight size={15} strokeWidth={2.4} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quality Verdict Banner */}
                  {result && (
                    <div className={`border p-4 ${currentVerdict.border} ${currentVerdict.bg}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-black uppercase tracking-wider ${currentVerdict.colorText}`}>
                          {currentVerdict.title}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase ${currentVerdict.badge}`}>
                          {currentVerdict.grade}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-relaxed uppercase opacity-80 mb-3 font-mono ${c.textPrimary}`}>
                        {currentVerdict.action}
                      </p>
                      <button
                        type="button"
                        onClick={exportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <FileSpreadsheet size={13} className={isDark ? "text-[#d5ff38]" : "text-emerald-700"} />
                        <span>EXPORT AUDIT CSV</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Optical Viewport */}
                <div className="lg:col-span-8 space-y-5">
                  <div className={`border ${c.line} ${c.surface} p-5`}>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: c.line }}>
                      <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>
                        <Scan size={14} />
                        <span>HIGH-RESOLUTION OPTICAL VIEWPORT</span>
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${c.textMuted}`}>
                        FOV: 200 × 200 MM
                      </span>
                    </div>

                    {/* Viewport Screen */}
                    <div className="relative aspect-square sm:aspect-[16/10] w-full bg-[#070805] border border-white/20 overflow-hidden select-none flex items-center justify-center shadow-2xl">
                      {!file && !result && (
                        <div className="text-center p-8 opacity-40">
                          <Crosshair size={40} className="text-[#d5ff38] mx-auto mb-3 animate-pulse" />
                          <p className="text-xs font-black uppercase tracking-widest text-white">
                            OPTICAL VIEWPORT READY // NO SPECIMEN LOADED
                          </p>
                          <p className="text-[10px] uppercase text-white/70 mt-1">
                            Click a preset above or drop an image on the left to begin.
                          </p>
                        </div>
                      )}

                      {loading && (
                        <div className="text-center p-8">
                          <LoaderCircle size={40} className="animate-spin text-[#d5ff38] mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-white">
                            EXTRACTING MULTI-SCALE CONVOLUTIONAL FEATURES...
                          </p>
                        </div>
                      )}

                      {file && !result && !loading && (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                          <img
                            src={preview}
                            alt="Raw Specimen"
                            className="max-h-full max-w-full object-contain filter contrast-110"
                          />
                          <div className="absolute top-3 left-3 text-[9px] bg-black/80 px-2 py-1 text-[#d5ff38] border border-white/20">
                            RAW OPTICAL SPECIMEN // AWAITING RUN
                          </div>
                        </div>
                      )}

                      {result && !loading && (
                        <div
                          ref={sliderRef}
                          onMouseMove={(e) => {
                            if (e.buttons === 1 || isDraggingSlider) handleSliderMove(e);
                          }}
                          onTouchMove={handleSliderMove}
                          onMouseDown={() => setIsDraggingSlider(true)}
                          onMouseUp={() => setIsDraggingSlider(false)}
                          className="relative w-full h-full flex items-center justify-center bg-black cursor-ew-resize group"
                        >
                          <img
                            src={preview}
                            alt="Raw Specimen"
                            className={`max-h-full max-w-full object-contain filter ${
                              viewMode === "contrast"
                                ? "invert contrast-200 grayscale"
                                : "contrast-110"
                            }`}
                          />

                          <div
                            style={{
                              clipPath:
                                viewMode === "raw"
                                  ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                                  : viewMode === "annotated" || viewMode === "contrast"
                                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                                  : `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                            }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          >
                            <img
                              src={result.result_image_url}
                              alt="YOLO Output"
                              className="max-h-full max-w-full object-contain filter contrast-110"
                            />
                          </div>

                          {viewMode === "split" && (
                            <div
                              style={{ left: `${sliderPos}%` }}
                              className="absolute top-0 bottom-0 w-0.5 bg-[#d5ff38] shadow-[0_0_12px_2px_#d5ff38] pointer-events-none"
                            >
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-[#d5ff38] text-black font-black flex items-center justify-center text-[10px] rounded-full shadow-lg">
                                ◀▶
                              </div>
                            </div>
                          )}

                          <div className="absolute top-3 left-3 text-[8px] font-black uppercase tracking-wider bg-black/80 text-white px-2.5 py-1 border border-white/20">
                            {viewMode === "split" ? "SPLIT COMPARE // DRAG SLIDER" : viewMode.toUpperCase()}
                          </div>

                          <div className="absolute bottom-3 right-3 text-[9px] font-mono font-bold uppercase tracking-wider bg-black/80 text-[#d5ff38] px-2.5 py-1 border border-[#d5ff38]/40">
                            FOUND: {filteredDetections.length} DEFECTS
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Localized Defect Annotations Grid */}
                  <div className={`border ${c.line} ${c.surface} p-5`}>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: c.line }}>
                      <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#d5ff38]" : "text-emerald-800"}`}>
                        <Activity size={14} />
                        <span>LOCALIZED ANNOTATIONS ({filteredDetections.length})</span>
                      </span>
                      <span className={`text-[10px] uppercase ${c.textMuted}`}>
                        {uniqueClasses} UNIQUE CLASSES
                      </span>
                    </div>

                    {filteredDetections.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredDetections.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 border text-xs transition-colors ${c.line} ${c.surfaceRaised}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[9px] font-mono ${c.textMuted}`}>
                                #{String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className={`text-[10px] font-black ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>
                                {confidencePercent(item.confidence).toFixed(1)}%
                              </span>
                            </div>
                            <div className={`font-black uppercase tracking-tight text-sm font-sans truncate ${c.textPrimary}`}>
                              {prettyName(item.defect)}
                            </div>
                            <div className={`mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[9px] font-mono ${c.textMuted}`}>
                              <span>BOUNDING BOX:</span>
                              <span>[{item.box?.map((v) => Math.round(v)).join(", ")}]</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-8 text-center border border-dashed text-xs uppercase ${c.textMuted}`} style={{ borderColor: c.line }}>
                        {result
                          ? "NO DEFECTS DETECTED ABOVE CONFIDENCE THRESHOLD"
                          : "AWAITING SPECIMEN INSPECTION RUN"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: QUALITY YIELD & METRICS INTELLIGENCE ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Header */}
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>
                    QUALITY YIELD & REAL-TIME SUCCESS INTELLIGENCE
                  </h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>
                    Continuous telemetry aggregated across rolling stands 01 through 04.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-[#d5ff38] border border-emerald-500/30 text-[10px] font-bold uppercase">
                    LIVE DATASTREAM
                  </span>
                  <button
                    onClick={() => setActiveTab("inspector")}
                    className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border shadow-sm ${c.accentButton}`}
                  >
                    <Crosshair size={13} strokeWidth={2.5} />
                    <span>LAUNCH LIVE INSPECTOR ↗</span>
                  </button>
                </div>
              </div>

              {/* 4 Hero KPI Cards with Success Rate Gauge */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Success Rate Circular Gauge */}
                <div className={`p-5 border ${c.line} ${c.surface} flex items-center justify-between`}>
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>
                      OVERALL SUCCESS RATE
                    </div>
                    <div className="text-3xl font-black font-sans mt-1 text-emerald-500">
                      94.8%
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp size={12} />
                      <span>+1.4% vs LAST WEEK</span>
                    </div>
                  </div>

                  {/* SVG Radial Gauge */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-black/10 dark:stroke-white/10"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-emerald-500"
                        strokeWidth="10"
                        strokeDasharray="251.3"
                        strokeDashoffset="13"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black font-sans">
                      95%
                    </div>
                  </div>
                </div>

                {/* 2. Total Inspected Today */}
                <div className={`p-5 border ${c.line} ${c.surface}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>
                    TOTAL COILS SCANNED
                  </div>
                  <div className={`text-3xl font-black font-sans mt-1 ${c.textPrimary}`}>
                    1,428
                  </div>
                  <div className={`text-[10px] mt-1 uppercase ${c.textMuted}`}>
                    Target: 1,500 Coils / Shift
                  </div>
                </div>

                {/* 3. Rejection / Quarantine Rate */}
                <div className={`p-5 border ${c.line} ${c.surface}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>
                    CRITICAL REJECTION RATE
                  </div>
                  <div className="text-3xl font-black font-sans mt-1 text-rose-500">
                    5.2%
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                    <TrendingDown size={12} />
                    <span>-0.8% REDUCTION</span>
                  </div>
                </div>

                {/* 4. Inference Speed & MTBF */}
                <div className={`p-5 border ${c.line} ${c.surface}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted}`}>
                    INFERENCE LATENCY
                  </div>
                  <div className={`text-3xl font-black font-sans mt-1 ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>
                    18.4 MS
                  </div>
                  <div className={`text-[10px] mt-1 uppercase ${c.textMuted}`}>
                    SUB-FRAME 60 FPS INLINE
                  </div>
                </div>
              </div>

              {/* 2 Large Industrial Graphs Grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Graph 1: 7-Day Inspection Throughput & Success Rate Trend */}
                <div className={`lg:col-span-8 p-6 border ${c.line} ${c.surface} flex flex-col justify-between`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b gap-2" style={{ borderColor: c.line }}>
                    <div>
                      <h3 className={`text-xs font-black uppercase tracking-wider ${c.textPrimary} flex items-center gap-2`}>
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span>7-DAY INSPECTION VOLUME & SUCCESS RATE TREND</span>
                      </h3>
                      <p className={`text-[10px] uppercase mt-0.5 ${c.textMuted}`}>
                        Coils passed vs rejected across rolling line 04
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-500">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                        PASSED
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-500">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                        REJECTED
                      </span>
                    </div>
                  </div>

                  {/* SVG Trend Line / Area Chart */}
                  <div className="relative aspect-[21/9] w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" className="opacity-10" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" className="opacity-10" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" className="opacity-10" strokeDasharray="3 3" />
                      <line x1="0" y1="180" x2="700" y2="180" stroke="currentColor" className="opacity-20" />

                      {/* Area Fill */}
                      <polygon
                        points="0,180 50,110 150,85 250,60 350,90 450,45 550,75 650,30 700,50 700,180 0,180"
                        fill="url(#areaGradient)"
                      />

                      {/* Trend Curve */}
                      <polyline
                        points="50,110 150,85 250,60 350,90 450,45 550,75 650,30"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Reject Bar Line */}
                      <polyline
                        points="50,165 150,162 250,170 350,160 450,155 550,168 650,172"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />

                      {/* Data Point Dots & Labels */}
                      {[
                        { x: 50, y: 110, rate: "94.3%" },
                        { x: 150, y: 85, rate: "94.7%" },
                        { x: 250, y: 60, rate: "96.5%" },
                        { x: 350, y: 90, rate: "94.8%" },
                        { x: 450, y: 45, rate: "93.9%" },
                        { x: 550, y: 75, rate: "95.2%" },
                        { x: 650, y: 30, rate: "95.1%" },
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="5" className="fill-[#10b981] stroke-black dark:stroke-white" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-current font-mono">
                            {pt.rate}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* X-Axis Day Labels */}
                    <div className="flex justify-between text-[10px] font-mono font-bold mt-2 uppercase opacity-60 px-4">
                      {TREND_DAYS.map((d) => (
                        <span key={d.day}>{d.day} ({d.total})</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Graph 2: Production Shifts Stacked Breakdown */}
                <div className={`lg:col-span-4 p-6 border ${c.line} ${c.surface} flex flex-col justify-between`}>
                  <div className="pb-4 mb-4 border-b" style={{ borderColor: c.line }}>
                    <h3 className={`text-xs font-black uppercase tracking-wider ${c.textPrimary}`}>
                      SHIFT PRODUCTION DISTRIBUTION
                    </h3>
                    <p className={`text-[10px] uppercase mt-0.5 ${c.textMuted}`}>
                      Pass vs Reject ratio by mill crew
                    </p>
                  </div>

                  <div className="space-y-5">
                    {[
                      { shift: "SHIFT A (06:00 - 14:00)", pass: 520, reject: 32, rate: "94.2%" },
                      { shift: "SHIFT B (14:00 - 22:00)", pass: 490, reject: 28, rate: "94.6%" },
                      { shift: "SHIFT C (22:00 - 06:00)", pass: 418, reject: 14, rate: "96.7%" },
                    ].map((shift, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase">
                          <span className={c.textPrimary}>{shift.shift}</span>
                          <span className="text-emerald-500 font-mono">{shift.rate}</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 h-3 flex overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(shift.pass / (shift.pass + shift.reject)) * 100}%` }}
                            title={`Passed: ${shift.pass}`}
                          />
                          <div
                            className="bg-rose-500 h-full"
                            style={{ width: `${(shift.reject / (shift.pass + shift.reject)) * 100}%` }}
                            title={`Rejected: ${shift.reject}`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono opacity-50 uppercase">
                          <span>Passed: {shift.pass}</span>
                          <span>Quarantined: {shift.reject}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[10px] uppercase font-bold flex justify-between">
                    <span className={c.textMuted}>TOTAL ROLLS TODAY:</span>
                    <span className={c.textPrimary}>1,502 UNITS</span>
                  </div>
                </div>
              </div>

              {/* Spatial Defect Heatmap & Class Breakdown Matrix */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Defect Incidence Profiles */}
                <div className={`lg:col-span-7 p-6 border ${c.line} ${c.surface}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider mb-5 ${c.textPrimary}`}>
                    DEFECT INCIDENCE PROFILES ACROSS NEU-DET (1,799 BENCHMARK SAMPLES)
                  </h3>

                  <div className="space-y-4">
                    {[
                      { name: "Crazing (Thermal Micro-Fissures)", percent: 18.2, count: 300, severity: "HIGH", color: "bg-rose-500" },
                      { name: "Inclusion (Slag / Oxide Impurities)", percent: 16.5, count: 300, severity: "CRITICAL", color: "bg-rose-600" },
                      { name: "Patches (Surface Scabs & Overlaps)", percent: 14.8, count: 300, severity: "MEDIUM", color: "bg-amber-500" },
                      { name: "Pitted Surface (Cavitation / Etch)", percent: 17.1, count: 300, severity: "HIGH", color: "bg-sky-500" },
                      { name: "Rolled-in Scale (Embedded Iron Oxide)", percent: 18.9, count: 300, severity: "HIGH", color: "bg-purple-500" },
                      { name: "Scratches (Guide Roller Gouges)", percent: 14.5, count: 300, severity: "MEDIUM", color: "bg-emerald-500" },
                    ].map((bar, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase">
                          <span className={c.textPrimary}>{bar.name}</span>
                          <span className={c.textMuted}>{bar.count} IMAGES ({bar.percent}%)</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 overflow-hidden">
                          <div
                            className={`h-full ${bar.color}`}
                            style={{ width: `${bar.percent * 4.5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spatial Strip Width Heatmap */}
                <div className={`lg:col-span-5 p-6 border ${c.line} ${c.surface} flex flex-col justify-between`}>
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-2 ${c.textPrimary}`}>
                      STRIP WIDTH SPATIAL DEFECT HEATMAP
                    </h3>
                    <p className={`text-[10px] uppercase mb-6 ${c.textMuted}`}>
                      Distribution of defect coordinates across steel coil transversal cross-section
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className="text-[10px] font-bold uppercase text-emerald-500">LEFT EDGE</div>
                        <div className="text-2xl font-black mt-1 font-sans">14%</div>
                        <div className={`text-[9px] uppercase mt-1 ${c.textMuted}`}>Zone 0–60mm</div>
                      </div>
                      <div className={`p-4 border-2 border-rose-500/50 bg-rose-500/10`}>
                        <div className="text-[10px] font-bold uppercase text-rose-500">CENTER BELT</div>
                        <div className="text-2xl font-black mt-1 font-sans text-rose-500">64%</div>
                        <div className={`text-[9px] uppercase mt-1 ${c.textMuted}`}>Zone 60–140mm</div>
                      </div>
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className="text-[10px] font-bold uppercase text-amber-500">RIGHT EDGE</div>
                        <div className="text-2xl font-black mt-1 font-sans">22%</div>
                        <div className={`text-[9px] uppercase mt-1 ${c.textMuted}`}>Zone 140–200mm</div>
                      </div>
                    </div>

                    <p className={`text-[10px] uppercase leading-relaxed mt-5 font-mono ${c.textMuted}`}>
                      Center belt concentration indicates roll barrel crown wear at finishing stand 03. Recommended corrective action: Regrind roll crown profiles at next shift maintenance.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className={c.textMuted}>CALIBRATION:</span>
                    <span className="text-emerald-500">OPTICAL ENCODER SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: BATCH QUEUE & PENDING TASKS ================= */}
          {activeTab === "queue" && (
            <div className="space-y-6">
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>
                    BATCH QUEUE & PENDING SPECIMEN RUNS
                  </h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>
                    Continuous coil inspections scheduled from line stands 01 through 04.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={simulateProcessBatch}
                    disabled={isProcessingQueue}
                    className="px-5 py-2.5 bg-[#d5ff38] text-black font-black text-xs uppercase tracking-wider hover:bg-[#c2ed20] transition-transform flex items-center gap-2 border border-black/10"
                  >
                    {isProcessingQueue ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} className="fill-current" />
                    )}
                    <span>{isProcessingQueue ? "PROCESSING BATCH..." : "RUN ENTIRE BATCH"}</span>
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className={`border ${c.line} ${c.surface} divide-y`} style={{ borderColor: c.line }}>
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${c.hover}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 border flex items-center justify-center font-bold text-xs" style={{ borderColor: c.line }}>
                        <Scan size={18} className={isDark ? "text-[#d5ff38]" : "text-emerald-700"} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-sm uppercase ${c.textPrimary}`}>
                            {task.coilId}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 border" style={{ borderColor: c.line }}>
                            {task.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black uppercase ${
                              task.priority === "CRITICAL"
                                ? "bg-red-500 text-white"
                                : task.priority === "HIGH"
                                ? "bg-amber-500 text-black"
                                : "bg-black/10 dark:bg-white/10"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 uppercase ${c.textMuted}`}>
                          Line: {task.line} · Queued at {task.time} · Specimen: {task.sample}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase">
                          STATUS:{" "}
                          <span
                            className={
                              task.status === "COMPLETED"
                                ? "text-emerald-600 font-black"
                                : task.status === "PROCESSING"
                                ? "text-amber-500 font-black"
                                : c.textMuted
                            }
                          >
                            {task.status}
                          </span>
                        </div>
                        {task.progress > 0 && task.progress < 100 && (
                          <div className="w-32 bg-black/10 dark:bg-white/10 h-1.5 mt-1 overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => runQueueTask(task)}
                        className="px-4 py-2 border text-xs font-bold uppercase tracking-wider hover:bg-[#d5ff38] hover:text-black hover:border-[#d5ff38] transition-all"
                        style={{ borderColor: c.line }}
                      >
                        INSPECT NOW ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: COMPLETED TASKS & AUDIT TRAIL ================= */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div className={`p-5 border ${c.line} ${c.surface} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>
                    COMPLETED TASKS & QUALITY AUDIT TRAIL
                  </h2>
                  <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>
                    Permanent verified records generated across continuous optical line stands.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="flex items-center border px-3 py-1.5 text-xs font-mono" style={{ borderColor: c.line }}>
                    <Search size={14} className="opacity-40 mr-2" />
                    <input
                      type="text"
                      placeholder="SEARCH COIL OR DEFECT..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="bg-transparent outline-none text-[11px] placeholder:opacity-40 uppercase w-36 sm:w-48"
                    />
                  </div>

                  {/* Filter Select */}
                  <div className="flex items-center gap-1 border p-1" style={{ borderColor: c.line }}>
                    {["ALL", "PASS", "WARNING", "REJECT"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f)}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
                          historyFilter === f
                            ? "bg-[#d5ff38] text-black font-black"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-[#d5ff38] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-black/10 hover:bg-[#c2ed20]"
                  >
                    <FileSpreadsheet size={15} />
                    <span>EXPORT AUDIT CSV</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className={`border ${c.line} ${c.surface} overflow-x-auto`}>
                <table className="w-full text-left text-xs font-mono">
                  <thead className={`border-b text-[10px] uppercase ${c.line} ${c.surfaceRaised} ${c.textMuted}`}>
                    <tr>
                      <th className="p-3.5">RECORD ID</th>
                      <th className="p-3.5">COIL REF</th>
                      <th className="p-3.5">SPECIMEN</th>
                      <th className="p-3.5">DEFECT COUNT</th>
                      <th className="p-3.5">PRIMARY DEFECT</th>
                      <th className="p-3.5">CONFIDENCE</th>
                      <th className="p-3.5">GRADE</th>
                      <th className="p-3.5">VERDICT</th>
                      <th className="p-3.5">OPERATOR</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${c.line}`}>
                    {displayedCompleted.map((row) => (
                      <tr key={row.id} className={`${c.hover} transition-colors`}>
                        <td className="p-3.5 font-bold">{row.id}</td>
                        <td className={`p-3.5 font-bold ${c.textPrimary}`}>{row.coilId}</td>
                        <td className={`p-3.5 ${c.textMuted}`}>{row.specimen}</td>
                        <td className="p-3.5 font-bold">{row.defectCount}</td>
                        <td className="p-3.5 uppercase font-bold text-amber-500">
                          {prettyName(row.primaryDefect)}
                        </td>
                        <td className={`p-3.5 font-bold ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>
                          {row.confidence}
                        </td>
                        <td className="p-3.5 font-bold text-[10px]">{row.grade}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black uppercase ${
                              row.verdict === "PASS"
                                ? "bg-emerald-600 text-white"
                                : row.verdict === "WARNING"
                                ? "bg-amber-500 text-black"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {row.verdict}
                          </span>
                        </td>
                        <td className={`p-3.5 ${c.textMuted}`}>{row.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: MODEL BENCHMARKS ================= */}
          {activeTab === "benchmarks" && (
            <div className="space-y-6">
              <div className={`p-5 border ${c.line} ${c.surface}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight font-sans ${c.textPrimary}`}>
                  YOLO11 WEIGHTS & TRAINING BENCHMARK LAB
                </h2>
                <p className={`text-xs uppercase mt-1 ${c.textMuted}`}>
                  Model evaluation results from outputs/training/neu_det_improved
                </p>
              </div>

              <div className={`p-6 border ${c.line} ${c.surface}`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${c.textPrimary}`}>
                      ACTIVE MODEL WEIGHTS & CONFIGURATION
                    </h3>
                    <div className="space-y-3 text-xs font-mono">
                      <div className={`p-3 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] ${c.textMuted}`}>WEIGHTS PATH:</div>
                        <div className="font-bold text-[11px] truncate">
                          outputs/training/neu_det_improved/weights/best.pt
                        </div>
                      </div>
                      <div className={`p-3 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] ${c.textMuted}`}>ARCHITECTURE:</div>
                        <div className="font-bold">YOLO11 Nano Backbone (2.6M Parameters)</div>
                      </div>
                      <div className={`p-3 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] ${c.textMuted}`}>TRAINING RESOLUTION:</div>
                        <div className="font-bold">320 × 320 px (Batch 4, AdamW)</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${c.textPrimary}`}>
                      BENCHMARK METRICS SUMMARY
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] uppercase ${c.textMuted}`}>PRECISION</div>
                        <div className="text-2xl font-black mt-1">61.5%</div>
                      </div>
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] uppercase ${c.textMuted}`}>RECALL</div>
                        <div className="text-2xl font-black mt-1">66.3%</div>
                      </div>
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] uppercase ${c.textMuted}`}>mAP@50</div>
                        <div className={`text-2xl font-black mt-1 ${isDark ? "text-[#d5ff38]" : "text-emerald-700"}`}>
                          67.7%
                        </div>
                      </div>
                      <div className={`p-4 border ${c.line} ${c.surfaceRaised}`}>
                        <div className={`text-[10px] uppercase ${c.textMuted}`}>mAP@50-95</div>
                        <div className="text-2xl font-black mt-1">34.4%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= 3. COMPACT TACTILE FOOTER ================= */}
      <footer className={`border-t ${c.line} ${c.surface} px-4 sm:px-6 py-2.5 text-[10px] uppercase tracking-widest flex flex-col sm:flex-row items-center justify-between gap-2 select-none`}>
        <div className="flex items-center gap-4">
          <span className={c.textPrimary}>DEFECTVISION STUDIO v2.4 // COIL QUALITY ASSURANCE</span>
          <span className="hidden md:inline opacity-30">|</span>
          <span className={`hidden md:inline ${c.textMuted}`}>PORT 8000 (FASTAPI) · PORT 5173 (VITE)</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-emerald-500 transition-colors">
            LANDING PAGE
          </Link>
          <span className={c.textMuted}>DIN EN 10163 COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
}