// Mobile card list. Wrap it in the same responsive classes as the real list,

import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// e.g. <div className="md:hidden"><CardListSkeleton count={5} /></div>
export default function CardListSkeleton({ count = 4, label = "Loading list" }) {
    return (
        <SkeletonRegion label={label} className="space-y-3">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="card border border-base-200 bg-base-100 shadow-sm"
                >
                    <div className="card-body gap-3 p-3 sm:p-4">
                        <SkeletonBar className="h-5 w-2/3" />
                        <SkeletonBar className="h-4 w-1/2" />
                        <SkeletonBar className="h-4 w-1/3" />
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}