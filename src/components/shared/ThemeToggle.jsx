import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="btn btn-ghost btn-circle btn-xs sm:btn-sm shrink-0"
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            {theme === "light" ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-base-content" />
            ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            )}
        </button>
    );
}