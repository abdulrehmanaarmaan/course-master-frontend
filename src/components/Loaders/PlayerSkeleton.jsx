import SkeletonBar from "./SkeletonBar";

// Full layout skeleton for the student course player.
export function PlayerSkeleton() {
    return (
        <main
            role="status"
            aria-live="polite"
            className="min-h-dvh overflow-x-clip bg-base-200"
        >
            <span className="sr-only">Loading your course</span>

            <div className="border-b border-base-300 bg-base-100 px-3 py-3 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4">
                    <SkeletonBar className="h-6 w-48 sm:w-72" />
                    <SkeletonBar className="h-6 w-24" />
                </div>
            </div>

            <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="min-w-0 space-y-4 sm:space-y-6">
                    <SkeletonBar className="aspect-video w-full rounded-xl" />

                    <div className="min-w-0 space-y-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6 lg:p-7">
                        <SkeletonBar className="h-4 w-32" />
                        <SkeletonBar className="h-8 w-2/3" />
                        <SkeletonBar className="h-4 w-full" />
                        <SkeletonBar className="h-4 w-5/6" />

                        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                            <SkeletonBar className="h-12 w-full" />
                            <SkeletonBar className="h-12 w-full" />
                            <SkeletonBar className="h-12 w-full" />
                        </div>
                    </div>
                </section>

                <aside className="min-w-0 space-y-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
                    <SkeletonBar className="h-6 w-40" />
                    <SkeletonBar className="h-4 w-32" />
                    <SkeletonBar className="h-2 w-full" />
                    {Array.from({ length: 6 }, (_, i) => (
                        <SkeletonBar key={i} className="h-12 w-full" />
                    ))}
                </aside>
            </div>
        </main>
    );
}