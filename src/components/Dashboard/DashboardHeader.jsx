import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, LayoutDashboard, Home, BookOpen } from "lucide-react";
import Logo from "../shared/Logo";
import { getMe } from "../../services/auth.api";
import { clearToken, getToken } from "../../utils/auth";
import ThemeToggle from "../shared/ThemeToggle";

export default function DashboardHeader({ onToggleSidebar }) {
    const navigate = useNavigate();
    const token = getToken();
    const [me, setMe] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        clearToken();
        setMe(null);
        setProfileOpen(false);
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const loadMe = async () => {
            if (!token) return setMe(null);
            try {
                const res = await getMe();
                setMe(res.data);
            } catch {
                clearToken();
                setMe(null);
            }
        };
        loadMe();
    }, [token]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initials = me?.name
        ? me.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    return (
        <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b border-base-300 w-full px-3 sm:px-6 py-2.5">
            <div className="flex items-center justify-between gap-2">

                {/* LEFT: Sidebar Toggle Button (Mobile/Tablet) + Logo */}
                <div className="flex items-center gap-2">
                    {onToggleSidebar && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="btn btn-ghost btn-circle btn-sm lg:hidden min-h-[36px] min-w-[36px]"
                            aria-label="Toggle Navigation Sidebar"
                        >
                            <Menu className="w-5 h-5 text-base-content shrink-0" />
                        </button>
                    )}
                    <Logo />
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3">

                    <Link
                        to="/"
                        className="btn btn-ghost btn-sm hidden sm:inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-base-content/80 hover:text-primary"
                    >
                        <Home className="w-4 h-4 shrink-0" /> Home
                    </Link>

                    <Link
                        to="/courses"
                        className="btn btn-ghost btn-sm hidden md:inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-base-content/80 hover:text-primary"
                    >
                        <BookOpen className="w-4 h-4 shrink-0" /> Courses
                    </Link>

                    <ThemeToggle />

                    {/* Profile Dropdown */}
                    {me && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="btn btn-ghost btn-circle avatar min-h-0"
                            >
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
                                    {initials}
                                </div>
                            </button>

                            {profileOpen && (
                                <ul className="absolute right-0 mt-2 p-3 shadow-xl bg-base-100 rounded-2xl w-56 sm:w-60 border border-base-300 z-50 space-y-1 animate-in fade-in duration-150">
                                    <div className="px-2 pb-2">
                                        <p className="font-bold text-sm text-base-content truncate">{me.name}</p>
                                        <p className="text-xs text-base-content/70 truncate">{me.email}</p>
                                        <span className="badge badge-primary badge-outline badge-xs mt-1.5 uppercase font-semibold">
                                            {me.role} Portal
                                        </span>
                                    </div>

                                    <div className="my-1 border-t border-base-200" />

                                    <li>
                                        <Link
                                            to={me.role === "admin" ? "/admin" : "/student"}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm hover:bg-base-200 rounded-lg font-medium text-base-content"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-primary shrink-0" /> Dashboard
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to={`${me.role === "admin" ? "/admin" : "/student"}/profile`}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm hover:bg-base-200 rounded-lg font-medium text-base-content"
                                        >
                                            <User className="w-4 h-4 text-primary shrink-0" /> Profile
                                        </Link>
                                    </li>

                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs sm:text-sm hover:bg-error/10 text-error rounded-lg font-semibold"
                                        >
                                            <LogOut className="w-4 h-4 shrink-0" /> Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}