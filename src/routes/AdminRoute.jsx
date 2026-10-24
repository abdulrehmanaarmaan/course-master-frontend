// AdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { getMe } from "../services/auth.api";
import DashboardLayoutSkeleton from "../components/Loaders/DashboardLayoutSkeleton";

export default function AdminRoute({ children }) {
    const [status, setStatus] = useState("loading");
    const [user, setUser] = useState(null);
    const { pathname } = useLocation()

    useEffect(() => {
        let cancelled = false;

        if (!getToken()) {
            () => setStatus("unauthenticated");
        }

        getMe()
            .then((res) => {
                if (cancelled) return;
                setUser(res.data);
                setStatus("loaded");
            })
            .catch(() => {
                if (cancelled) return;
                setStatus("unauthenticated");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "loading") return <DashboardLayoutSkeleton role="admin" />;
    if (status === "unauthenticated") return <Navigate to="/login" replace />;
    if (user?.role !== "admin" && pathname.startsWith("/admin")) return <Navigate to="/unauthorized" replace />;

    return children;
}