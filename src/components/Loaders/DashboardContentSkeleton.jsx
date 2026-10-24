
export default function DashboardContentSkeleton() {
    return (
        <section
            className="mx-auto w-full max-w-7xl"
            role="status"
            aria-label="Loading page content"
        >
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
                        <div className="skeleton mb-4 h-9 w-9 rounded-lg" />
                        <div className="skeleton mb-3 h-5 w-2/3 rounded-md" />
                        <div className="skeleton h-4 w-full rounded-md" />
                        <div className="skeleton mt-2 h-4 w-4/5 rounded-md" />
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-2xl border border-base-300 p-5">
                <div className="skeleton mb-5 h-5 w-40 rounded-md" />

                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="mb-4 flex items-center gap-3">
                        <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />
                        <div className="flex-1">
                            <div className="skeleton h-4 w-2/3 rounded-md" />
                            <div className="skeleton mt-2 h-3 w-1/2 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>

            <span className="sr-only">Loading page content…</span>
        </section>
    );
}
