import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { getToken, clearToken } from "../../utils/auth";
import { getMe } from "../../services/auth.api";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = getToken();
    const [me, setMe] = useState(null);
    const [mobileOpenPath, setMobileOpenPath] = useState(null);
    const [profileOpenPath, setProfileOpenPath] = useState(null);
    const mobileOpen = mobileOpenPath === location.pathname;
    const profileOpen = profileOpenPath === location.pathname;
    const navRef = useRef(null);

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-primary font-bold"
            : "text-base-content/80 hover:text-primary font-medium transition-colors";

    const handleLogout = () => {
        clearToken();
        setMe(null);
        setMobileOpenPath(null);
        setProfileOpenPath(null);
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

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setMobileOpenPath(null);
                setProfileOpenPath(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initials = me?.name
        ? me.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    return (
        <header ref={navRef} className="sticky top-0 z-50 bg-base-100/90 backdrop-blur border-b border-base-300 w-full">
            <div className="navbar max-w-6xl mx-auto px-3 sm:px-4">
                {/* LEFT: Logo */}
                <div className="navbar-start">
                    <Logo />
                </div>

                {/* CENTER: Desktop Menu */}
                <div className="navbar-center hidden md:flex">
                    <ul className="menu menu-horizontal gap-1 px-1">
                        <li><NavLink className={navLinkClass} to="/">Home</NavLink></li>
                        <li><NavLink className={navLinkClass} to="/courses">Courses</NavLink></li>
                        <li><NavLink className={navLinkClass} to="/about">About Us</NavLink></li>

                        {token && me ? (
                            <li>
                                <NavLink
                                    className={navLinkClass}
                                    to={me?.role === "admin" ? "/admin" : "/student"}
                                >
                                    Dashboard
                                </NavLink>
                            </li>
                        ) : localStorage.getItem("dev_bypass") === "true" ? (
                            <>
                                <li><NavLink className={navLinkClass} to="/student">Student Portal</NavLink></li>
                                <li><NavLink className={navLinkClass} to="/admin">Admin Portal</NavLink></li>
                            </>
                        ) : null}
                    </ul>
                </div>

                {/* RIGHT: Actions */}
                <div className="navbar-end gap-1.5 sm:gap-2">
                    <ThemeToggle />

                    {/* Desktop Non-Auth */}
                    {!token && (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Enroll Now</Link>
                        </div>
                    )}

                    {/* Desktop Profile Dropdown */}
                    {token && me && (
                        <div className="hidden md:block relative">
                            <button
                                type="button"
                                onClick={() => setProfileOpenPath(profileOpen ? null : location.pathname)}
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                    {initials}
                                </div>
                            </button>

                            {profileOpen && (
                                <ul className="absolute right-0 mt-2 p-3 shadow-xl bg-base-100 rounded-2xl w-60 border border-base-300 z-50 space-y-1">
                                    <div className="px-2 pb-2">
                                        <p className="font-bold text-sm text-base-content truncate">{me.name}</p>
                                        <p className="text-xs text-base-content/70 truncate">{me.email}</p>
                                        <span className="badge badge-outline badge-xs mt-1 uppercase font-semibold">
                                            {me.role}
                                        </span>
                                    </div>
                                    <div className="my-1 border-t border-base-200" />
                                    <li>
                                        <Link
                                            to={me.role === "admin" ? "/admin" : "/student"}
                                            className="block px-3 py-1.5 text-sm hover:bg-base-200 rounded-lg font-medium"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={`${me.role === "admin" ? "/admin" : "/student"}/profile`}
                                            className="block px-3 py-1.5 text-sm hover:bg-base-200 rounded-lg font-medium"
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-error/10 text-error rounded-lg font-semibold"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <div className="md:hidden relative">
                        <button
                            type="button"
                            onClick={() => setMobileOpenPath(mobileOpen ? null : location.pathname)}
                            className="btn btn-ghost btn-circle btn-sm min-h-[36px] min-w-[36px]"
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Responsive Mobile Drawer */}
                        {mobileOpen && (
                            <ul className="absolute right-0 mt-2 p-3 shadow-2xl bg-base-100 rounded-2xl w-64 border border-base-300 z-50 max-h-[80vh] overflow-y-auto space-y-2">
                                {token && me && (
                                    <div className="flex items-center gap-3 p-2 bg-base-200/60 rounded-xl mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs truncate text-base-content">{me.name}</p>
                                            <p className="text-[11px] text-base-content/70 truncate">{me.email}</p>
                                        </div>
                                    </div>
                                )}

                                <li><NavLink className={navLinkClass} to="/">Home</NavLink></li>
                                <li><NavLink className={navLinkClass} to="/courses">Courses</NavLink></li>
                                <li><NavLink className={navLinkClass} to="/about">About Us</NavLink></li>

                                {token && me && (
                                    <>
                                        <li>
                                            <NavLink
                                                className={navLinkClass}
                                                to={me.role === "admin" ? "/admin" : "/student"}
                                            >
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li><NavLink className={navLinkClass} to="/profile">Profile</NavLink></li>
                                    </>
                                )}

                                <div className="my-2 border-t border-base-200" />

                                {!token ? (
                                    <div className="flex flex-col gap-2 pt-1">
                                        <Link to="/login" className="btn btn-ghost btn-sm w-full">Login</Link>
                                        <Link to="/register" className="btn btn-primary btn-sm w-full">Enroll Now</Link>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-outline btn-error btn-sm w-full mt-2"
                                    >
                                        Logout
                                    </button>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}