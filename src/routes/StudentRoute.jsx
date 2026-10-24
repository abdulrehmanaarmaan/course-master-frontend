// AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { getMe } from "../services/auth.api";
import DashboardLayoutSkeleton from "../components/Loaders/DashboardLayoutSkeleton";

export default function StudentRoute({ children }) {
    const [status, setStatus] = useState("loading");
    const [user, setUser] = useState(null);

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

    if (status === "loading") return <DashboardLayoutSkeleton role="student" />;
    if (status === "unauthenticated") return <Navigate to="/login" replace />;
    if (user?.role !== "student") return <Navigate to="/unauthorized" replace />;

    return children;
}