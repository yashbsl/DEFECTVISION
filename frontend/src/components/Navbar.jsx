import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  Menu,
  Moon,
  ScanLine,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const NAV_LINKS = [
  { label: "APPARATUS", to: "/#apparatus" },
  { label: "DEFECT MATRIX", to: "/#taxonomy" },
  { label: "SCHEMATIC", to: "/#schematic" },
  { label: "SPEC SHEET", to: "/#datasheet" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const c = isDark
    ? {
        bg: "bg-[#0f100c]/95 text-[#f5f4ed]",
        surface: "bg-[#171813]",
        line: "border-[#2a2c22]",
        muted: "text-[#8c8e80]",
        hover: "hover:text-[#d5ff38] hover:bg-white/5",
        accent: "bg-[#d5ff38] text-black",
      }
    : {
        bg: "bg-[#f4f3ec]/95 text-[#151611]",
        surface: "bg-[#eae8de]",
        line: "border-[#d0cebf]",
        muted: "text-[#6e7062]",
        hover: "hover:text-[#4e6600] hover:bg-black/5",
        accent: "bg-[#d5ff38] text-black",
      };

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-200 font-mono ${c.bg} ${c.line}`}>
      <nav className="mx-auto flex max-w-[1680px] items-stretch justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3.5 px-5 py-4 border-r transition-colors group ${c.line} ${c.hover}`}
        >
          <div className="flex h-9 w-9 items-center justify-center bg-[#d5ff38] text-black font-black text-lg tracking-tighter group-hover:rotate-90 transition-transform">
            <ScanLine size={20} strokeWidth={2.4} />
          </div>
          <div>
            <span className="text-sm font-black tracking-[-0.04em] block uppercase font-sans leading-none">
              DEFECTVISION<span className="text-[#ff5436]">.</span>
            </span>
            <span className="text-[8px] tracking-[0.22em] uppercase block opacity-60 mt-1">
              INSPECTION ARCHIVE
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-stretch text-xs font-bold tracking-widest uppercase">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.to}
              className={`flex items-center px-6 border-r transition-colors ${c.line} ${c.muted} ${c.hover}`}
            >
              [ {item.label} ]
            </a>
          ))}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-6 border-r transition-colors ${c.line} ${
                isActive ? "text-[#d5ff38] font-black" : `${c.muted} ${c.hover}`
              }`
            }
          >
            [ RUNTIME STUDIO ]
          </NavLink>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-stretch">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            className={`flex items-center gap-2 px-5 border-l text-[11px] font-bold uppercase tracking-wider transition-colors ${c.line} ${c.hover}`}
            title="Toggle theme"
          >
            {isDark ? <Sun size={14} className="text-[#d5ff38]" /> : <Moon size={14} />}
            <span>{isDark ? "LIGHT" : "DARK"}</span>
          </button>

          <Link
            to="/login"
            className={`flex items-center px-6 border-l text-xs font-bold uppercase tracking-wider transition-colors ${c.line} ${c.hover}`}
          >
            SIGN IN
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-6 sm:px-8 text-xs font-black uppercase tracking-wider bg-[#d5ff38] text-black hover:bg-[#c2ed20] transition-colors"
          >
            <Zap size={14} className="fill-current" />
            <span>STUDIO</span>
            <ArrowUpRight size={15} strokeWidth={2.4} />
          </Link>
        </div>

        {/* Mobile menu and theme buttons */}
        <div className="flex items-stretch sm:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`flex items-center justify-center w-12 border-l transition-colors ${c.line}`}
          >
            {isDark ? <Sun size={16} className="text-[#d5ff38]" /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className={`flex items-center justify-center w-12 border-l transition-colors ${c.line}`}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className={`border-t px-5 py-6 sm:hidden space-y-4 ${c.surface} ${c.line}`}>
          <div className="space-y-1">
            {NAV_LINKS.map((item, idx) => (
              <a
                key={item.label}
                href={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3 border-b text-xs font-bold uppercase tracking-wider ${c.line} ${c.muted} hover:text-white`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] opacity-40 font-mono">0{idx + 1}</span>
              </a>
            ))}

            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between py-3 border-b text-xs font-bold uppercase tracking-wider text-[#d5ff38] ${c.line}`}
            >
              <span>RUNTIME STUDIO</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className={`border py-3 text-center text-xs font-bold uppercase tracking-wider ${c.line}`}
            >
              SIGN IN
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#d5ff38] text-black py-3 text-xs font-black uppercase tracking-wider"
            >
              <span>LAUNCH</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="pt-2 text-[9px] uppercase tracking-widest opacity-40 text-center">
            DEFECTVISION ARCHIVE // REVISION 04
          </div>
        </div>
      )}
    </header>
  );
}