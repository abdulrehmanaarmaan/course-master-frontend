import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// Course cards. Pass the SAME grid classes that CoursesGrid uses.
export default function CourseGridSkeleton({
    count = 8,
    className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
}) {
    return (
        <SkeletonRegion label="Loading courses" className={className}>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="card overflow-hidden border border-base-300 bg-base-100 shadow-sm"
                >
                    <SkeletonBar className="h-40 w-full rounded-none" />
                    <div className="card-body gap-3 p-4">
                        <SkeletonBar className="h-5 w-4/5" />
                        <SkeletonBar className="h-4 w-1/2" />
                        <div className="flex items-center justify-between pt-2">
                            <SkeletonBar className="h-5 w-16" />
                            <SkeletonBar className="h-8 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}