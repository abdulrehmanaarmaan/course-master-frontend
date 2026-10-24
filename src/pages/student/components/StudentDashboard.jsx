import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, UserRound } from "lucide-react";

import DashboardHeader from "../../../components/Dashboard/DashboardHeader";
import StudentDashboardSidebar from "./StudentSidebar";
import { Outlet } from "react-router-dom";

export default function StudentDashboard() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuButtonRef = useRef(null);

    useEffect(() => {
        if (!mobileMenuOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [mobileMenuOpen]);

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen((open) => !open);
    }, []);

    const navigationItems = [
        {
            to: "/student",
            label: "My Courses",
            Icon: BookOpen,
        },
        {
            to: "/student/profile",
            label: "My Profile",
            Icon: UserRound,
        }
    ];

    return (
        <div className="min-h-screen overflow-x-clip bg-base-100 text-base-content">
            <DashboardHeader onToggleSidebar={toggleMobileMenu} />

            <div className="flex min-h-[calc(100vh-64px)]">
                <StudentDashboardSidebar
                    navigationItems={navigationItems}
                    mobileMenuOpen={mobileMenuOpen}
                    closeMobileMenu={closeMobileMenu}
                    mobileMenuButtonRef={mobileMenuButtonRef}
                />

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
