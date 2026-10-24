
export default function DashboardLayoutSkeleton({ role = "student" }) {
    const isAdmin = role === "admin";
    const sidebarItems = isAdmin ? 8 : 2;

    return (
        <div
            className="min-h-screen bg-base-100 text-base-content"
            role="status"
            aria-label={`Loading ${role} dashboard`}
        >
            {/* Header placeholder */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-base-300 bg-base-100 px-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-9 w-9 shrink-0 rounded-lg lg:hidden" />
                    <div className="skeleton h-8 w-32 rounded-lg" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="skeleton hidden h-8 w-16 rounded-lg sm:block" />
                    <div className="skeleton hidden h-8 w-20 rounded-lg md:block" />
                    <div className="skeleton h-9 w-9 rounded-full" />
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-4rem)]">
                {/* Sidebar placeholder */}
                <aside className="hidden w-56 shrink-0 flex-col border-r border-base-300 bg-base-200/50 p-4 lg:flex xl:w-60">
                    {isAdmin && (
                        <div className="skeleton mb-5 h-4 w-28 rounded-md" />
                    )}

                    <div className="space-y-3">
                        {Array.from(
                            { length: sidebarItems },
                            (_, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${index === 0
                                        ? "bg-primary/5"
                                        : ""
                                        }`}
                                >
                                    <div className="skeleton h-5 w-5 shrink-0 rounded-md" />
                                    <div className="skeleton h-4 flex-1 rounded-md" />
                                </div>
                            )
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="mt-auto rounded-xl border border-base-300 p-4">
                            <div className="skeleton mb-3 h-9 w-9 rounded-lg" />
                            <div className="skeleton mb-2 h-4 w-28 rounded-md" />
                            <div className="skeleton h-3 w-full rounded-md" />
                            <div className="skeleton mt-2 h-3 w-4/5 rounded-md" />
                        </div>
                    )}
                </aside>

                {/* Main content placeholder */}
                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 space-y-3">
                        <div className="skeleton h-7 w-48 max-w-full rounded-lg" />
                        <div className="skeleton h-4 w-72 max-w-full rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-base-300 p-5"
                            >
                                <div className="skeleton mb-4 h-10 w-10 rounded-xl" />
                                <div className="skeleton mb-3 h-5 w-2/3 rounded-md" />
                                <div className="skeleton h-4 w-full rounded-md" />
                                <div className="skeleton mt-2 h-4 w-4/5 rounded-md" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-base-300 p-5 sm:p-6">
                        <div className="skeleton mb-5 h-5 w-40 rounded-md" />

                        <div className="space-y-4">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />
                                    <div className="min-w-0 flex-1">
                                        <div className="skeleton h-4 w-2/3 rounded-md" />
                                        <div className="skeleton mt-2 h-3 w-1/2 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <span className="sr-only">Loading dashboard content…</span>
        </div>
    );
}
