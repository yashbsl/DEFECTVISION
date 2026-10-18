
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="theme-toggle"
    >
      <span className="theme-toggle-icon">
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </span>
      <span className="hidden sm:inline">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}
