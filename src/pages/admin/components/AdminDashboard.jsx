import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import DashboardHeader from "../../../components/Dashboard/DashboardHeader";

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col w-full bg-base-100">
            {/* Top Dashboard Header */}
            <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex flex-1 w-full min-w-0 relative">
                {/* Sidebar Component */}
                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 w-full p-3 sm:p-5 lg:p-6 bg-base-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}