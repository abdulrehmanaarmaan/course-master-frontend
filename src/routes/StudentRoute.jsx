// AdminRoute.jsx
import { Navigate, redirect } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { getMe } from "../services/auth.api";

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
    }, [redirect]);

    if (status === "loading") return <div>Loading…</div>;
    if (status === "unauthenticated") return <Navigate to="/login" replace />;
    if (user?.role !== "student") return <Navigate to="/not-found" replace />;

    return children;
}