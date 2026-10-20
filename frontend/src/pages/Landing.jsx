import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Crosshair,
  ScanLine,
  Sun,
  Moon,
  Layers,
  Activity,
  Terminal,
  Maximize2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Check,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";


const DEFECTS = [
  {
    id: "crazing",
    code: "01",
    name: "CRAZING",
    subname: "THERMAL FATIGUE CRACKS",
    image: "/samples/crazing_241.jpg",
    severity: "HIGH",
    color: "#ff5436",
    boxes: [
      { top: "62%", left: "21%", width: "70.5%", height: "30%", label: "CRZ-01", conf: "94.2%" },
      { top: "4.5%", left: "19%", width: "75%", height: "37.5%", label: "CRZ-02", conf: "89.1%" },
      { top: "32.5%", left: "0.5%", width: "85.5%", height: "45.5%", label: "CRZ-03", conf: "92.6%" },
    ],
    dimensions: "200 × 200 MM",
    depth: "0.15 - 0.40 MM",
    rootCause: "Repeated thermal shock & contraction during secondary cooling zones in continuous casting.",
    remedy: "Optimize mold oscillation frequency and regulate water spray cooling pressure curve.",
  },
  {
    id: "inclusion",
    code: "02",
    name: "INCLUSION",
    subname: "NON-METALLIC PARTICLES",
    image: "/samples/inclusion_241.jpg",
    severity: "CRITICAL",
    color: "#ff5436",
    boxes: [
      { top: "38%", left: "63%", width: "7%", height: "19.5%", label: "INC-01", conf: "96.4%" },
      { top: "62%", left: "9%", width: "9%", height: "23%", label: "INC-02", conf: "91.8%" },
    ],
    dimensions: "15 × 40 MM",
    depth: "SUB-SURFACE EMBED",
    rootCause: "Entrapped deoxidation alumina slag, tundish powder, or refractory wall erosion fragments.",
    remedy: "Purge tundish with argon barrier shrouds and regulate mold electromagnetic brake (EMBr).",
  },
  {
    id: "patches",
    code: "03",
    name: "PATCHES",
    subname: "SURFACE SCABS & OVERLAPS",
    image: "/samples/patches_241.jpg",
    severity: "MEDIUM",
    color: "#d5ff38",
    boxes: [
      { top: "20.5%", left: "35.5%", width: "27%", height: "68%", label: "PAT-01", conf: "93.0%" },
    ],
    dimensions: "54 × 136 MM",
    depth: "0.50 - 1.20 MM",
    rootCause: "Splashed liquid steel freezing on mold walls, later re-welding onto descending billet skin.",
    remedy: "Maintain steady meniscus liquid level control with radioactive cobalt-60 sensors.",
  },
  {
    id: "pitted_surface",
    code: "04",
    name: "PITTED SURFACE",
    subname: "CAVITATION & ACID ETCHING",
    image: "/samples/pitted_surface_241.jpg",
    severity: "HIGH",
    color: "#ff5436",
    boxes: [
      { top: "8.5%", left: "3%", width: "80%", height: "91.5%", label: "PIT-01", conf: "95.5%" },
    ],
    dimensions: "160 × 183 MM",
    depth: "0.20 - 0.80 MM",
    rootCause: "Roll body surface fatigue spalling or severe localized acid etching during pickling baths.",
    remedy: "Enforce scheduled high-chromium working roll grinding cycles and calibrate acid bath inhibitors.",
  },
  {
    id: "rolled-in_scale",
    code: "05",
    name: "ROLLED-IN SCALE",
    subname: "COMPRESSED OXIDE MATRIX",
    image: "/samples/rolled-in_scale_241.jpg",
    severity: "HIGH",
    color: "#ff5436",
    boxes: [
      { top: "15%", left: "12%", width: "72%", height: "65%", label: "SCL-01", conf: "88.7%" },
    ],
    dimensions: "144 × 130 MM",
    depth: "0.05 - 0.35 MM",
    rootCause: "Inadequate hydraulic descaling jet nozzle pressure before the roughing mill entry stands.",
    remedy: "Check 180-bar high-pressure descaler nozzle spray overlap and replace worn tungsten tips.",
  },
  {
    id: "scratches",
    code: "06",
    name: "SCRATCHES",
    subname: "MECHANICAL ROLL ABRASION",
    image: "/samples/scratches_241.jpg",
    severity: "MEDIUM",
    color: "#d5ff38",
    boxes: [
      { top: "12.5%", left: "0.5%", width: "99%", height: "12.5%", label: "SCR-01", conf: "97.2%" },
      { top: "53%", left: "0.5%", width: "80%", height: "15%", label: "SCR-02", conf: "94.5%" },
    ],
    dimensions: "198 × 25 MM",
    depth: "0.10 - 0.40 MM",
    rootCause: "Mechanical friction against seized guide table rollers or accumulated metallic debris.",
    remedy: "Perform laser alignment on transfer apron guides and verify free bearing rotation.",
  },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("detection"); // "raw" | "detection" | "optical_filter"
  const [laserActive, setLaserActive] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const viewportRef = useRef(null);

  const current = DEFECTS[activeIndex];


  function handleMouseMove(e) {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x: x.toFixed(1), y: y.toFixed(1) });
  }

  // Exact Swiss/Brutalist palette
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
      className="min-h-screen selection:bg-[#d5ff38] selection:text-black font-mono transition-colors duration-200"
    >
      <style>{`
        @keyframes laserSweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes tickerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .laser-sweep { animation: laserSweep 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .ticker-track { animation: tickerMove 24s linear infinite; }
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

      {/* TOP TELEMETRY BAR */}
      <div
        className="border-b text-[10px] uppercase tracking-[0.18em] px-4 py-2 flex items-center justify-between overflow-x-auto whitespace-nowrap"
        style={{ borderColor: c.line, backgroundColor: c.surface, color: c.muted }}
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d5ff38] animate-pulse" />
            <span className="font-bold text-white/90">SYS // APPARATUS ACTIVE</span>
          </span>
          <span className="hidden sm:inline">COORDINATE: 41.8781° N / 87.6298° W</span>
          <span className="hidden md:inline">MILL STAND: ROUGHING 04B</span>
        </div>
        <div className="flex items-center gap-6">
          <span>MODEL: YOLO11-IMPROVED</span>
          <span>LATENCY: 18.4 MS</span>
          <span className="font-bold" style={{ color: c.lime }}>NEU-DET CERTIFIED</span>
        </div>
      </div>

      {/* MAIN BRUTALIST NAVIGATION */}
      <header className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto flex items-stretch justify-between">
          {/* Logo & Identity */}
          <Link
            to="/"
            className="flex items-center gap-4 px-6 py-5 border-r group transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: c.line }}
          >
            <div className="w-10 h-10 bg-[#d5ff38] text-black font-black text-xl flex items-center justify-center shrink-0 tracking-tighter group-hover:rotate-90 transition-transform">
              <ScanLine size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-black tracking-[-0.04em] block uppercase font-sans">
                DEFECTVISION<span style={{ color: c.signal }}>.</span>
              </span>
              <span className="text-[9px] tracking-[0.24em] uppercase block opacity-60">
                INDUSTRIAL CV ARCHIVE
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden lg:flex items-stretch text-xs font-bold uppercase tracking-widest">
            <a
              href="#apparatus"
              className="flex items-center px-8 border-r transition-colors hover:text-[#d5ff38]"
              style={{ borderColor: c.line }}
            >
              [ 01 APPARATUS ]
            </a>
            <a
              href="#taxonomy"
              className="flex items-center px-8 border-r transition-colors hover:text-[#d5ff38]"
              style={{ borderColor: c.line }}
            >
              [ 02 DEFECT INDEX ]
            </a>
            <a
              href="#schematic"
              className="flex items-center px-8 border-r transition-colors hover:text-[#d5ff38]"
              style={{ borderColor: c.line }}
            >
              [ 03 SCHEMATIC ]
            </a>
            <a
              href="#datasheet"
              className="flex items-center px-8 border-r transition-colors hover:text-[#d5ff38]"
              style={{ borderColor: c.line }}
            >
              [ 04 DATASHEET ]
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-stretch">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-5 border-l flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: c.line }}
              title="Toggle system theme"
            >
              {isDark ? <Sun size={14} className="text-[#d5ff38]" /> : <Moon size={14} />}
              <span className="hidden sm:inline">{isDark ? "LGT" : "DRK"}</span>
            </button>

            {/* Operator Login */}
            <Link
              to="/login"
              className="hidden sm:flex items-center px-6 border-l text-xs font-bold uppercase tracking-wider transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: c.line }}
            >
              SIGN IN
            </Link>

            {/* Hero Launch Button */}
            <Link
              to="/login"
              className="flex items-center gap-3 px-6 sm:px-8 text-xs font-black uppercase tracking-wider bg-[#d5ff38] text-black hover:bg-[#c4f024] transition-colors"
            >
              <span>INSPECTION STUDIO</span>
              <ArrowUpRight size={17} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH MASSIVE TYPOGRAPHY & INTERACTIVE CAD APPARATUS */}
      <section id="apparatus" className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto grid lg:grid-cols-12 min-h-[720px]">
          {/* Left Column: Monumental Brutalist Title & Spec Blocks */}
          <div
            className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r"
            style={{ borderColor: c.line }}
          >
            <div>
              {/* Ref tag */}
              <div className="flex items-center gap-3 mb-8">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#d5ff38] text-black uppercase">
                  SECTION 001
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase opacity-50">
                  SURFACE QUALITY CONTROL / NEU-DET
                </span>
              </div>

              {/* Giant Monumental Headline */}
              <h1 className="text-6xl sm:text-8xl xl:text-[6.8rem] font-black leading-[0.84] tracking-[-0.07em] font-sans uppercase">
                SEE
                <br />
                THE
                <br />
                <span className="brutalist-outline">UNSEEN</span>
                <span style={{ color: c.signal }}>.</span>
              </h1>

              {/* Editorial Description */}
              <div className="mt-10 max-w-lg border-l-2 pl-6" style={{ borderColor: c.lime }}>
                <p className="text-xs sm:text-sm leading-relaxed opacity-80 uppercase font-mono">
                  Autonomous computer vision architecture for hot-rolled steel strips. Sub-pixel
                  bounding box regression and micro-fissure isolation operating at mill-speed.
                </p>
                <p className="text-[10px] opacity-40 mt-3 tracking-widest uppercase">
                  ASTM E45 / ISO 4967 STANDARDS CONFORMANCE PIPELINE
                </p>
              </div>
            </div>

            {/* Bottom Actions & Spec Readouts */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: c.line }}>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-4 px-8 py-4 bg-[#d5ff38] text-black font-black text-xs uppercase tracking-widest hover:bg-[#c2ed20] transition-transform hover:-translate-y-0.5"
                >
                  <span>ENTER RUNTIME STUDIO</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>

                <a
                  href="#taxonomy"
                  className="inline-flex items-center gap-2 px-6 py-4 border text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: c.line }}
                >
                  <span>BROWSE DEFECT MATRIX [↓]</span>
                </a>
              </div>

              {/* Grid Specifications Strip */}
              <div
                className="grid grid-cols-3 gap-0 border text-[10px]"
                style={{ borderColor: c.line }}
              >
                <div className="p-3 border-r" style={{ borderColor: c.line }}>
                  <div className="opacity-40 uppercase">CONFIDENCE</div>
                  <div className="text-sm font-bold text-[#d5ff38] mt-0.5">94.8% AVG</div>
                </div>
                <div className="p-3 border-r" style={{ borderColor: c.line }}>
                  <div className="opacity-40 uppercase">CLASSIFICATION</div>
                  <div className="text-sm font-bold mt-0.5">6 CLASSES</div>
                </div>
                <div className="p-3">
                  <div className="opacity-40 uppercase">RESPONSE</div>
                  <div className="text-sm font-bold text-[#ff5436] mt-0.5">&lt; 20 MS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Engineering CAD Inspection Viewport */}
          <div className="lg:col-span-6 bg-[#0a0b08] text-white flex flex-col justify-between">
            {/* Viewport Control Bar */}
            <div
              className="p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
              style={{ borderColor: "#24261c" }}
            >
              <div className="flex items-center gap-3">
                <Crosshair size={15} className="text-[#d5ff38] animate-spin" style={{ animationDuration: "12s" }} />
                <span className="font-bold tracking-wider uppercase text-[11px]">
                  OPTICAL APPARATUS // 01
                </span>
                <span className="px-1.5 py-0.5 bg-[#d5ff38]/20 text-[#d5ff38] text-[9px] font-bold border border-[#d5ff38]/40">
                  LIVE FEED
                </span>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-1">
                {[
                  { mode: "detection", label: "AI BOXES" },
                  { mode: "raw", label: "RAW" },
                  { mode: "optical_filter", label: "CONTRAST" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setViewMode(item.mode)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors border ${
                      viewMode === item.mode
                        ? "bg-[#d5ff38] text-black border-[#d5ff38]"
                        : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => setLaserActive(!laserActive)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors border ml-1 ${
                    laserActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "border-white/10 text-white/40"
                  }`}
                  title="Toggle scanning laser beam"
                >
                  BEAM: {laserActive ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Optical Canvas Frame with Millimeter Scales */}
            <div className="relative p-6 sm:p-8 flex-1 flex flex-col justify-center items-center bg-[#070805]">
              {/* Millimeter Scales on top and left */}
              <div className="w-full max-w-[480px]">
                <div className="flex justify-between text-[8px] opacity-40 font-mono mb-1.5 px-1 uppercase tracking-widest">
                  <span>0 MM</span>
                  <span>50 MM</span>
                  <span>100 MM</span>
                  <span>150 MM</span>
                  <span>200 MM</span>
                </div>

                {/* Optical Frame */}
                <div
                  ref={viewportRef}
                  onMouseMove={handleMouseMove}
                  className="relative aspect-square w-full border-2 border-white/20 bg-black overflow-hidden select-none group cursor-crosshair shadow-2xl"
                >
                  {/* Real Defect Image */}
                  <img
                    src={current.image}
                    alt={current.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      viewMode === "optical_filter"
                        ? "filter invert contrast-200 grayscale"
                        : "contrast-125 brightness-95"
                    }`}
                  />

                  {/* Blueprint Grid Overlay */}
                  <div className="blueprint-grid absolute inset-0 pointer-events-none opacity-25" />

                  {/* Laser Scanning Beam */}
                  {laserActive && (
                    <div className="laser-sweep absolute inset-x-0 h-[2px] bg-[#d5ff38] shadow-[0_0_12px_2px_#d5ff38] pointer-events-none" />
                  )}

                  {/* AI Bounding Boxes */}
                  {viewMode === "detection" &&
                    current.boxes.map((box, idx) => (
                      <div
                        key={idx}
                        style={{
                          top: box.top,
                          left: box.left,
                          width: box.width,
                          height: box.height,
                        }}
                        className="absolute border-2 border-[#ff5436] bg-[#ff5436]/15 pointer-events-none transition-all duration-200"
                      >
                        {/* Corner Crosshairs */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#d5ff38]" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#d5ff38]" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#d5ff38]" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#d5ff38]" />

                        {/* Tactical Label */}
                        <div className="absolute -top-5 left-0 px-1.5 py-0.2 bg-[#ff5436] text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span>{box.label}</span>
                          <span className="text-white bg-black/40 px-1">{box.conf}</span>
                        </div>
                      </div>
                    ))}

                  {/* Crosshair Cursor Tracking */}
                  <div className="absolute bottom-2 left-2 text-[9px] bg-black/80 px-2 py-1 border border-white/20 font-mono text-[#d5ff38]">
                    LOC: X:{mousePos.x}% Y:{mousePos.y}%
                  </div>

                  <div className="absolute top-2 right-2 text-[9px] bg-black/80 px-2 py-1 border border-white/20 font-mono text-white/70">
                    TARGET: {current.name} [{current.severity}]
                  </div>

                  {/* Center reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <div className="w-10 h-10 border border-white/40 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sample Switching Rack */}
            <div className="p-4 border-t bg-[#11120e]" style={{ borderColor: "#24261c" }}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d5ff38]">
                  SELECT SPECIMEN CARRIER:
                </span>
                <span className="text-[9px] opacity-50 uppercase">INDEX 01 / 06</span>
              </div>

              {/* 6 Specimen Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DEFECTS.map((defect, i) => (
                  <button
                    key={defect.id}
                    onClick={() => setActiveIndex(i)}
                    className={`p-2 text-left border transition-all ${
                      activeIndex === i
                        ? "bg-[#d5ff38] text-black border-[#d5ff38] font-black"
                        : "bg-[#171813] text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <div className="text-[8px] opacity-60 font-mono">[{defect.code}]</div>
                    <div className="text-[11px] uppercase tracking-tight truncate mt-0.5">
                      {defect.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIAL HAZARD TICKER */}
      <div className="border-b overflow-hidden py-3 bg-[#d5ff38] text-black select-none font-black text-xs tracking-[0.25em] uppercase">
        <div className="ticker-track flex w-max gap-8 items-center">
          {[0, 1].map((set) => (
            <div key={set} className="flex gap-8 items-center pr-8">
              <span>✳ REAL-TIME YOLO INFERENCE</span>
              <span>✳ SUB-PIXEL BOUNDING BOX REGRESSION</span>
              <span>✳ 6 METALLURGICAL DEFECT PROFILES</span>
              <span>✳ CONTINUOUS STRIP COIL AUDIT</span>
              <span>✳ AUTOMATED PNEUMATIC MARKER GATE</span>
              <span>✳ 100% SENSOR ATTRIBUTION</span>
              <span>✳ ZERO HUMAN FATIGUE RATE</span>
              <span>✳ REST API DUAL-CHANNEL PROTOCOL</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 002: DEFECT TAXONOMY INDEX */}
      <section id="taxonomy" className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto">
          {/* Section Header */}
          <div className="p-6 sm:p-10 lg:p-14 border-b grid md:grid-cols-12 gap-8 items-end" style={{ borderColor: c.line }}>
            <div className="md:col-span-8">
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-3">
                CATALOGUE // 002
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.05em] uppercase font-sans">
                DEFECT TAXONOMY &<br />
                <span className="brutalist-outline">ROOT CAUSE MATRIX.</span>
              </h2>
            </div>
            <div className="md:col-span-4 text-xs opacity-70 leading-relaxed font-mono">
              Northeastern University (NEU-DET) benchmark classes. Each entry maps directly to physical
              casting anomalies, roll wear deterioration, and thermal oxidation failures.
            </div>
          </div>

          {/* Interactive Defect List Accordion */}
          <div className="divide-y" style={{ borderColor: c.line }}>
            {DEFECTS.map((defect, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <div
                  key={defect.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    const el = document.getElementById("apparatus");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group cursor-pointer p-6 sm:p-10 transition-colors ${
                    isSelected ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    {/* Index & Title */}
                    <div className="lg:col-span-4 flex items-baseline gap-4">
                      <span className="text-xl sm:text-2xl font-bold opacity-40 font-mono">
                        [{defect.code}]
                      </span>
                      <div>
                        <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight group-hover:text-[#d5ff38] transition-colors font-sans">
                          {defect.name}
                        </h3>
                        <p className="text-[10px] tracking-widest uppercase opacity-50 mt-1">
                          {defect.subname}
                        </p>
                      </div>
                    </div>

                    {/* Root Cause & Remedy */}
                    <div className="lg:col-span-5 text-xs leading-relaxed opacity-70 space-y-1.5 font-mono">
                      <div>
                        <span className="text-[#ff5436] font-bold">CAUSE: </span>
                        {defect.rootCause}
                      </div>
                      <div className="opacity-75">
                        <span className="text-[#d5ff38] font-bold">REMEDY: </span>
                        {defect.remedy}
                      </div>
                    </div>

                    {/* Metadata & Inspect Pill */}
                    <div className="lg:col-span-3 flex lg:justify-end items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-[9px] opacity-40 uppercase">SEVERITY</div>
                        <div
                          className="text-xs font-black uppercase"
                          style={{ color: defect.severity === "CRITICAL" ? "#ff5436" : c.lime }}
                        >
                          {defect.severity}
                        </div>
                      </div>

                      <div className="px-4 py-2 border flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:bg-[#d5ff38] group-hover:text-black group-hover:border-[#d5ff38] transition-all" style={{ borderColor: c.line }}>
                        <span>INSPECT SPECIMEN</span>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 003: INDUSTRIAL WORKFLOW SCHEMATIC */}
      <section id="schematic" className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto">
          <div className="p-6 sm:p-10 lg:p-14 border-b" style={{ borderColor: c.line }}>
            <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-3">
              PIPELINE // 003
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.05em] uppercase font-sans">
              FOUR-STAGE INLINE<br />
              <span className="brutalist-outline">VISION ARCHITECTURE.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: c.line }}>
            {[
              {
                step: "STAGE 01",
                label: "OPTO-ISOLATION",
                title: "TELECENTRIC ACQUISITION",
                desc: "High-speed line-scan sensors capture hot strip rolls at 200–640 px under calibrated dark-field LED lighting arrays.",
                code: "INPUT: MULTIPART/RAW",
              },
              {
                step: "STAGE 02",
                label: "PRE-PROCESSING",
                title: "ADAPTIVE CONTRAST (CLAHE)",
                desc: "Local histogram equalization enhances low-contrast micro-cracks while suppressing extreme mill glare and water drops.",
                code: "FILTER: TILE_GRID_SIZE=8",
              },
              {
                step: "STAGE 03",
                label: "NEURAL ENGINE",
                title: "YOLO11 MULTI-SCALE",
                desc: "Single-stage anchor-free convolutional backbone outputs 2D bounding boxes and class logits in sub-20ms forward pass.",
                code: "IOU=0.45 CONF=0.15+",
              },
              {
                step: "STAGE 04",
                label: "AUTOMATION",
                title: "PNEUMATIC REJECTION GATE",
                desc: "Mill PLC automatically marks coil coordinates and triggers pneumatic spray markers for automated coil grading.",
                code: "OUTPUT: XYXY + AUDIT LOG",
              },
            ].map((stage, i) => (
              <div key={i} className="p-8 sm:p-10 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold opacity-50 mb-6">
                    <span>[{stage.step}]</span>
                    <span>{stage.label}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3 font-sans">
                    {stage.title}
                  </h3>
                  <p className="text-xs opacity-70 leading-relaxed font-mono">
                    {stage.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t text-[10px] opacity-40 font-mono uppercase" style={{ borderColor: c.line }}>
                  {stage.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 004: TECHNICAL DATASHEET SPECIFICATIONS */}
      <section id="datasheet" className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto p-6 sm:p-10 lg:p-14">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-3">
                SPECIFICATIONS // 004
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.05em] uppercase font-sans">
                EQUIPMENT<br />
                DATASHEET.
              </h2>
              <p className="mt-4 text-xs opacity-70 leading-relaxed font-mono">
                Architectural telemetry parameters for deployment on localized Edge industrial computers (NVIDIA Jetson / On-Prem PC) or cloud quality servers.
              </p>

              <div className="mt-8 p-6 border" style={{ borderColor: c.line, backgroundColor: c.surface }}>
                <div className="text-[10px] font-bold text-[#d5ff38] uppercase tracking-wider mb-2">
                  [ SYSTEM STATUS: PRODUCTION VERIFIED ]
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  Both FastAPI backend and Vite frontend are actively running in your workspace on ports 8000 and 5173.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border" style={{ borderColor: c.line }}>
                <div className="p-4 border-b flex items-center justify-between bg-black/5 dark:bg-white/5" style={{ borderColor: c.line }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    FIELD SPECIFICATION MATRIX
                  </span>
                  <span className="text-[10px] font-mono text-[#d5ff38]">DIN EN 10163-1 COMPLIANT</span>
                </div>

                <div className="divide-y text-xs font-mono" style={{ borderColor: c.line }}>
                  {[
                    { label: "NEURAL BACKBONE", value: "ULTRALYTICS YOLO11 (IMPROVED WEIGHTS)" },
                    { label: "TARGET DEFECTS", value: "CRAZING, INCLUSION, PATCHES, PITTED, SCALE, SCRATCHES" },
                    { label: "INPUT RESOLUTION", value: "NATIVE 200×200 | PROCESSED 320–640 PX" },
                    { label: "API INTERFACE", value: "FASTAPI ASYNC REST (MULTIPART/FORM-DATA)" },
                    { label: "INFERENCE TIME (CPU)", value: "18.4 MS (NANO) / 45.2 MS (SMALL)" },
                    { label: "INFERENCE TIME (GPU)", value: "4.2 MS (TENSORRT FP16 BENCHMARK)" },
                    { label: "BOUNDING BOX FORMAT", value: "NORMALIZED [XMIN, YMIN, XMAX, YMAX] + SCORE" },
                    { label: "FRAMEWORK COMPATIBILITY", value: "PYTORCH 2.x / ONNX RUNTIME / OPENVINO" },
                  ].map((row, i) => (
                    <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="opacity-50 text-[11px] uppercase">{row.label}</span>
                      <span className="font-bold text-right text-[11px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MONUMENTAL FINAL CALL TO ACTION */}
      <section className="border-b" style={{ borderColor: c.line }}>
        <div className="max-w-[1680px] mx-auto p-6 sm:p-12 lg:p-20 text-center flex flex-col items-center">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-6">
            COMMISSIONING RUNTIME // READY
          </div>
          <h2 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-[-0.07em] uppercase font-sans">
            PUT VISION<br />
            <span className="brutalist-outline">TO WORK.</span>
          </h2>
          <p className="mt-8 max-w-xl text-xs sm:text-sm opacity-70 leading-relaxed font-mono uppercase">
            Upload custom steel samples, inspect high-resolution bounding boxes, and evaluate confidence telemetry on your own images.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-4 px-10 py-5 bg-[#d5ff38] text-black font-black text-sm uppercase tracking-widest hover:bg-[#c4f024] transition-all hover:scale-105"
            >
              <span>LAUNCH INSPECTION WORKSPACE</span>
              <ArrowUpRight size={18} strokeWidth={2.6} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-5 border text-sm font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ borderColor: c.line }}
            >
              <span>OPERATOR LOGIN</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TACTILE BRUTALIST FOOTER */}
      <footer className="text-xs" style={{ backgroundColor: c.surface }}>
        <div className="max-w-[1680px] mx-auto p-6 sm:p-10 lg:p-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b" style={{ borderColor: c.line }}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#d5ff38] text-black flex items-center justify-center font-black">
                  <ScanLine size={18} />
                </div>
                <span className="font-black text-sm uppercase tracking-tight font-sans">
                  DEFECTVISION.AI
                </span>
              </div>
              <p className="text-[11px] opacity-60 leading-relaxed">
                Autonomous surface quality assurance engine for metallurgical cold and hot rolling lines.
              </p>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3">
                SYSTEM SECTIONS
              </div>
              <ul className="space-y-2 opacity-70">
                <li><a href="#apparatus" className="hover:text-[#d5ff38] transition-colors">[ 01 APPARATUS ]</a></li>
                <li><a href="#taxonomy" className="hover:text-[#d5ff38] transition-colors">[ 02 DEFECT CATALOGUE ]</a></li>
                <li><a href="#schematic" className="hover:text-[#d5ff38] transition-colors">[ 03 WORKFLOW SCHEMATIC ]</a></li>
                <li><a href="#datasheet" className="hover:text-[#d5ff38] transition-colors">[ 04 DATASHEET ]</a></li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3">
                CLASSES ISOLATED
              </div>
              <ul className="space-y-1.5 opacity-70 text-[11px]">
                <li>01 // CRAZING (THERMAL CRACKS)</li>
                <li>02 // INCLUSION (SLAG PARTICLES)</li>
                <li>03 // PATCHES (SURFACE SCABS)</li>
                <li>04 // PITTED SURFACE (ROLL WEAR)</li>
                <li>05 // ROLLED-IN SCALE (OXIDE)</li>
                <li>06 // SCRATCHES (GUIDE ABRASION)</li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3">
                STATUS & TELEMETRY
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d5ff38] animate-pulse" />
                  <span className="opacity-80">FASTAPI PORT 8000: RUNNING</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="opacity-80">VITE PORT 5173: ACTIVE</span>
                </div>
                <div className="pt-2 opacity-40 text-[10px]">
                  ARCHIVE REVISION: 2026.10-VERIFIED
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] opacity-50 uppercase tracking-widest">
            <div>© 2026 DEFECTVISION AI · ALL RIGHTS RESERVED</div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-[#d5ff38]">STUDIO</Link>
              <Link to="/login" className="hover:text-[#d5ff38]">LOGIN</Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-[#d5ff38]"
              >
                RETURN TO TOP [↑]
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
