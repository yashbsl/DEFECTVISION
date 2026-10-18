import { ArrowUpRight, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Footer() {
  const { isDark } = useTheme();

  const c = isDark
    ? {
        bg: "bg-[#171813] text-[#f5f4ed]",
        line: "border-[#2a2c22]",
        muted: "text-[#8c8e80]",
        accent: "text-[#d5ff38]",
      }
    : {
        bg: "bg-[#eae8de] text-[#151611]",
        line: "border-[#d0cebf]",
        muted: "text-[#6e7062]",
        accent: "text-[#4e6600]",
      };

  return (
    <footer className={`border-t text-xs font-mono transition-colors duration-200 ${c.bg} ${c.line}`}>
      <div className="mx-auto max-w-[1680px] p-6 sm:p-10 lg:p-14">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b ${c.line}`}>
          {/* Brand & mission */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-8 h-8 bg-[#d5ff38] text-black font-black flex items-center justify-center text-sm group-hover:rotate-90 transition-transform">
                <ScanLine size={18} strokeWidth={2.4} />
              </div>
              <span className="font-black text-sm uppercase tracking-tight font-sans">
                DEFECTVISION<span className="text-[#ff5436]">.AI</span>
              </span>
            </Link>
            <p className={`text-[11px] leading-relaxed ${c.muted}`}>
              Autonomous metallurgical defect detection for industrial rolling mills. Trained on the NEU-DET surface benchmark dataset.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className={`text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3 ${c.muted}`}>
              NAVIGATION ARCHIVE
            </div>
            <ul className={`space-y-2 text-[11px] ${c.muted}`}>
              <li><Link to="/#apparatus" className="hover:text-[#d5ff38] transition-colors">[ 01 APPARATUS ]</Link></li>
              <li><Link to="/#taxonomy" className="hover:text-[#d5ff38] transition-colors">[ 02 DEFECT CATALOGUE ]</Link></li>
              <li><Link to="/#schematic" className="hover:text-[#d5ff38] transition-colors">[ 03 WORKFLOW SCHEMATIC ]</Link></li>
              <li><Link to="/#datasheet" className="hover:text-[#d5ff38] transition-colors">[ 04 DATASHEET ]</Link></li>
            </ul>
          </div>

          {/* Defect categories */}
          <div>
            <div className={`text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3 ${c.muted}`}>
              DEFECT CLASSES
            </div>
            <ul className={`space-y-1.5 text-[11px] ${c.muted}`}>
              <li>01 // CRAZING (THERMAL CRACKS)</li>
              <li>02 // INCLUSION (SLAG IMPURITY)</li>
              <li>03 // PATCHES (SURFACE SCABS)</li>
              <li>04 // PITTED SURFACE (ROLL WEAR)</li>
              <li>05 // ROLLED-IN SCALE (OXIDE)</li>
              <li>06 // SCRATCHES (ROLL ABRASION)</li>
            </ul>
          </div>

          {/* Runtime Status */}
          <div>
            <div className={`text-[10px] font-bold tracking-widest uppercase opacity-40 mb-3 ${c.muted}`}>
              SYSTEM TELEMETRY
            </div>
            <div className={`space-y-2 text-[11px] ${c.muted}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d5ff38] animate-pulse" />
                <span className="font-bold text-white/90">API PORT 8000: ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>YOLO11 WEIGHTS: LOADED</span>
              </div>
              <div className="pt-2 text-[10px] opacity-50">
                ARCHIVE REVISION 2026.10-PRO
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest ${c.muted}`}>
          <div>© 2026 DEFECTVISION AI · METALLURGICAL QUALITY CONTROL</div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-[#d5ff38] transition-colors">STUDIO</Link>
            <Link to="/login" className="hover:text-[#d5ff38] transition-colors">LOGIN</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-[#d5ff38] transition-colors flex items-center gap-1"
            >
              <span>RETURN TO TOP [↑]</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
