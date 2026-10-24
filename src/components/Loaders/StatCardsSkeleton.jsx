import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// Row of stat cards. Pass the same grid classes as the real stat cards.
export default function StatCardsSkeleton({
    count = 3,
    className = "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4",
}) {
    return (
        <SkeletonRegion label="Loading statistics" className={className}>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="card border border-base-300 bg-base-100 shadow-sm"
                >
                    <div className="card-body gap-3 p-4 sm:p-5">
                        <SkeletonBar className="h-4 w-28" />
                        <SkeletonBar className="h-8 w-16" />
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}