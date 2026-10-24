import { useEffect, createElement } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    ClipboardList,
    BarChart3,
    Video,
    X,
    Book,
    UserRound,
} from "lucide-react";

const menuItems = [
    {
        to: "/admin",
        label: "Overview",
        Icon: LayoutDashboard,
        end: true,
    },
    {
        to: "/admin/courses/create",
        label: "Add Course",
        Icon: PlusCircle,
        end: true,
    },
    {
        to: "/admin/video-classes",
        label: "Video Classes",
        Icon: Video,
        end: true,
    },
    {
        to: "/admin/enrollments",
        label: "Enrollments",
        Icon: Users,
        end: true,
    },
    {
        to: "/admin/assignments",
        label: "Assignments",
        Icon: ClipboardList,
        end: true,
    },
    {
        to: "/admin/analytics",
        label: "Analytics",
        Icon: BarChart3,
        end: true,
    },
    {
        to: "/admin/courses",
        label: "Manage Courses",
        Icon: Book,
        end: true,
    },
    {
        to: "/admin/users",
        label: "Manage Users",
        Icon: Users,
        end: true,
    },
    {
        to: "/admin/profile",
        label: "My Profile",
        Icon: UserRound,
        end: true,
    }
];

function SidebarItem({
    to,
    label,
    Icon,
    end = true,
    onClick,
}) {
    const linkClass = ({ isActive }) => {
        const baseClasses =
            "flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 min-h-[40px]";

        if (isActive) {
            return `${baseClasses} bg-primary text-primary-content font-semibold`;
        }

        return `${baseClasses} text-base-content/80 font-medium hover:bg-primary/10 hover:text-primary`;
    };

    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={linkClass}
        >
            {createElement(Icon, {
                className: "h-5 w-5 shrink-0",
                "aria-hidden": true,
            })}

            <span className="min-w-0 truncate text-sm">
                {label}
            </span>
        </NavLink>
    );
}

export default function AdminSidebar({ isOpen, onClose }) {

    // Prevent background scrolling while mobile drawer is open
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
                        id="admin-mobile-navigation"
                        className="flex h-dvh w-[min(20rem,88vw)] max-w-full flex-col overflow-hidden border-r border-base-300 bg-base-200 shadow-2xl animate-in slide-in-from-left duration-200"
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Admin navigation"
                    >
                        {/* Drawer heading */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 px-4 py-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <LayoutDashboard
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-bold text-base-content">
                                        Admin Menu
                                    </h2>
                                    <p className="text-xs text-base-content/60">
                                        Manage your platform
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost btn-sm btn-square shrink-0"
                                aria-label="Close admin navigation"
                            >
                                <X
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        {/* Scrollable navigation */}
                        <nav
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4"
                            aria-label="Admin menu"
                        >
                            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-base-content/50">
                                Management
                            </p>

                            <div className="space-y-1.5">
                                {menuItems.map((item) => (
                                    <SidebarItem
                                        key={item.to}
                                        {...item}
                                        onClick={onClose}
                                    />
                                ))}
                            </div>
                        </nav>

                        {/* Drawer footer */}
                        <div className="shrink-0 border-t border-base-300 px-4 py-3">
                            <p className="text-center text-xs text-base-content/50">
                                Admin Dashboard
                            </p>
                        </div>
                    </aside>
                </div>
            )}

            {/* Desktop and laptop permanent sidebar */}
            <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-200/50 lg:flex xl:w-60 2xl:w-64">
                <nav
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 xl:p-4"
                    aria-label="Admin navigation"
                >
                    <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-base-content/50">
                        Management
                    </p>

                    <div className="space-y-1.5">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                            />
                        ))}
                    </div>
                </nav>

                <div className="shrink-0 border-t border-base-300 px-4 py-3">
                    <p className="truncate text-center text-xs text-base-content/50">
                        Admin Dashboard
                    </p>
                </div>
            </aside>
        </>
    );
}