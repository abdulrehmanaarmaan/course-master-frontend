import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// Form fields (render the real <h1> above it).
export default function FormSkeleton() {
    return (
        <SkeletonRegion label="Loading form" className="w-full space-y-5">
            <SkeletonBar className="h-12 w-full" />
            <SkeletonBar className="h-28 w-full" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SkeletonBar className="h-12 w-full" />
                <SkeletonBar className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SkeletonBar className="h-12 w-full" />
                <SkeletonBar className="h-12 w-full" />
            </div>
            <SkeletonBar className="h-40 w-full" />
        </SkeletonRegion>
    );
}