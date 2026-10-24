import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// Chart card. Pass the SAME height classes as the real chart container.
export default function ChartCardSkeleton({
    heightClass = "h-[220px] sm:h-[260px]",
    label = "Loading chart",
}) {
    return (
        <SkeletonRegion
            label={label}
            className="card overflow-hidden border border-base-300 bg-base-100 shadow-sm"
        >
            <div className="card-body p-3 sm:p-6">
                <SkeletonBar className="mb-3 h-5 w-48 sm:mb-4" />
                <SkeletonBar className={`w-full ${heightClass}`} />
            </div>
        </SkeletonRegion>
    );
}