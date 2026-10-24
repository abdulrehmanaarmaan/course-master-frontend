export default function SkeletonBar({ className = "" }) {
    return <span className={`skeleton block ${className}`} aria-hidden="true" />;
}