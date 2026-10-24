import { useCallback, useEffect, useState } from "react";
import { getMe } from "../../services/auth.api";

const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(parsedDate);
};

const getInitials = (name = "") => {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getMe();
            const profile = response.data?.user ?? response.data;

            if (!profile || typeof profile !== "object") {
                throw new Error("Unable to retrieve your profile.");
            }

            setUser(profile);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getMe();
                const profile = response.data?.user ?? response.data;

                if (!profile || typeof profile !== "object") {
                    throw new Error("Unable to retrieve your profile.");
                }

                if (active) setUser(profile);
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load your profile."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <main
                className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8"
                aria-busy="true"
            >
                <div className="mb-6">
                    <div className="h-8 w-40 animate-pulse rounded bg-base-300" />
                    <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-base-300" />
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-base-300" />
                        <div className="flex-1 space-y-3 w-full">
                            <div className="h-5 w-48 max-w-full mx-auto sm:mx-0 animate-pulse rounded bg-base-300" />
                            <div className="h-4 w-60 max-w-full mx-auto sm:mx-0 animate-pulse rounded bg-base-300" />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-20 animate-pulse rounded-xl bg-base-200"
                            />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="rounded-2xl border border-error/30 bg-base-100 p-6 sm:p-8 shadow-sm">
                    <h1 className="text-2xl font-bold">My Profile</h1>

                    <p className="mt-4 text-error text-sm sm:text-base break-words" role="alert">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="btn btn-primary mt-5 min-h-[44px]"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    const role = user?.role;
    const isBanned = user?.isBanned === true;

    return (
        <main className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-base-content">
                    My Profile
                </h1>

                <p className="mt-1.5 text-xs sm:text-sm text-base-content/70">
                    View your account information and account status.
                </p>
            </header>

            <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                {/* User Header Card Banner */}
                <div className="border-b border-base-300 bg-base-200/50 p-5 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                        <div
                            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content shadow-md"
                            aria-label={`Avatar initials for ${user?.name || "user"}`}
                        >
                            {getInitials(user?.name) || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="break-words text-xl font-bold sm:text-2xl text-base-content">
                                {user?.name || "Unnamed User"}
                            </h2>

                            <p className="mt-1 break-all text-xs sm:text-sm text-base-content/70">
                                {user?.email || "No email available"}
                            </p>

                            <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="badge badge-primary badge-outline capitalize font-semibold">
                                    {role || "Unknown role"}
                                </span>

                                <span
                                    className={`badge ${isBanned
                                        ? "badge-error"
                                        : "badge-success"
                                        } badge-outline font-semibold`}
                                >
                                    {isBanned ? "Banned" : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-5 sm:p-8">
                    <h3 className="text-base sm:text-lg font-bold text-base-content">
                        Account Information
                    </h3>

                    <div className="mt-4 grid gap-3.5 grid-cols-1 sm:grid-cols-2">
                        <div className="min-w-0 rounded-xl border border-base-300/80 bg-base-200/20 p-4 transition-all hover:border-primary/40">
                            <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                                Full Name
                            </p>
                            <p className="mt-1.5 break-words font-semibold text-sm sm:text-base text-base-content">
                                {user?.name || "Not available"}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl border border-base-300/80 bg-base-200/20 p-4 transition-all hover:border-primary/40">
                            <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                                Email Address
                            </p>
                            <p className="mt-1.5 break-all font-semibold text-sm sm:text-base text-base-content">
                                {user?.email || "Not available"}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl border border-base-300/80 bg-base-200/20 p-4 transition-all hover:border-primary/40">
                            <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                                Account Role
                            </p>
                            <p className="mt-1.5 font-semibold text-sm sm:text-base capitalize text-base-content">
                                {role || "Not available"}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl border border-base-300/80 bg-base-200/20 p-4 transition-all hover:border-primary/40">
                            <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                                Member Since
                            </p>
                            <p className="mt-1.5 font-semibold text-sm sm:text-base text-base-content">
                                {formatDate(user?.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Profile;