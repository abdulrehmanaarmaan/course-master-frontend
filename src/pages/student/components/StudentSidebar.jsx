import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { GraduationCap, Trophy, X } from "lucide-react";

export default function StudentSidebar({
    navigationItems,
    isOpen,
    onClose,
    mobileMenuButtonRef,
}) {
    // Prevent background scrolling while the mobile drawer is open
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && onClose) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Mobile drawer backdrop and panel */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                >
                    <aside
                        id="student-mobile-navigation"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Student navigation menu"
                        className="flex h-dvh w-[min(20rem,88vw)] max-w-full flex-col overflow-hidden border-r border-base-300 bg-base-200 shadow-2xl animate-in slide-in-from-left duration-200"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Drawer heading with Logo / Branding */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 px-4 py-4">
                            <Link
                                to="/"
                                onClick={onClose}
                                className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-base-300/60"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
                                    <GraduationCap className="h-6 w-6" />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-bold text-base-content">
                                        Learning Hub
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        Student Portal
                                    </p>
                                </div>
                            </Link>

                            <button
                                ref={mobileMenuButtonRef}
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost btn-sm btn-square shrink-0"
                                aria-label="Close dashboard navigation"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Scrollable navigation */}
                        <nav
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4"
                            aria-label="Mobile student navigation"
                        >
                            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-base-content/50">
                                Learning
                            </p>

                            <div className="space-y-1.5">
                                {navigationItems.map(({ to, label, Icon }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === "/student"}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${isActive
                                                ? "bg-primary font-semibold text-primary-content"
                                                : "font-medium text-base-content/80 hover:bg-primary/10 hover:text-primary"
                                            }`
                                        }
                                    >
                                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        <span className="truncate text-sm">{label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </nav>

                        {/* Drawer footer / Trophy card */}
                        <div className="shrink-0 border-t border-base-300 p-4">
                            <div className="rounded-xl border border-base-300 bg-base-100 p-4">
                                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Trophy className="h-5 w-5" />
                                </div>

                                <p className="text-sm font-semibold text-base-content">
                                    Keep learning
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-base-content/60">
                                    Every completed lesson brings you closer to your goals.
                                </p>

                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className="btn btn-primary btn-sm mt-3 w-full"
                                >
                                    Explore Courses
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Desktop and laptop permanent sidebar */}
            <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-200/50 lg:flex xl:w-60 2xl:w-64 p-4">
                <Link
                    to="/"
                    className="mb-6 flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-base-300/60"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
                        <GraduationCap className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-bold text-base-content">
                            Learning Hub
                        </p>
                        <p className="text-xs text-base-content/60">
                            Student Portal
                        </p>
                    </div>
                </Link>

                <nav
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                    aria-label="Student navigation"
                >
                    <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-base-content/50">
                        Learning
                    </p>

                    <div className="space-y-1.5">
                        {navigationItems.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/student"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${isActive
                                        ? "bg-primary font-semibold text-primary-content"
                                        : "font-medium text-base-content/80 hover:bg-primary/10 hover:text-primary"
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                <span className="truncate text-sm">{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="shrink-0 mt-auto rounded-xl border border-base-300 bg-base-100 p-4">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Trophy className="h-5 w-5" />
                    </div>

                    <p className="text-sm font-semibold text-base-content">
                        Keep learning
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-base-content/60">
                        Every completed lesson brings you closer to your goals.
                    </p>

                    <Link
                        to="/"
                        className="btn btn-primary btn-sm mt-3 w-full"
                    >
                        Explore Courses
                    </Link>
                </div>
            </aside>
        </>
    );
}