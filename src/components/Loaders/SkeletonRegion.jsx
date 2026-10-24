// Announces "loading" once to screen readers; the visual blocks stay hidden from them.
export default function SkeletonRegion({ label = "Loading", className = "", children }) {
    return (
        <div role="status" aria-live="polite" className={className}>
            {children}
            <span className="sr-only">{label}</span>
        </div>
    );
}