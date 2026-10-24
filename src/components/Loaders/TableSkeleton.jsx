// Desktop table. Wrap it in the same responsive classes as the real table,

import SkeletonBar from "./SkeletonBar";
import SkeletonRegion from "./SkeletonRegion";

// e.g. <div className="hidden md:block"><TableSkeleton columns={6} rows={10} /></div>
export default function TableSkeleton({ columns = 5, rows = 6, label = "Loading table" }) {
    return (
        <SkeletonRegion
            label={label}
            className="overflow-x-auto rounded-lg border border-base-300"
        >
            <table className="table w-full">
                <thead className="bg-base-200">
                    <tr>
                        {Array.from({ length: columns }, (_, c) => (
                            <th key={c}>
                                <SkeletonBar className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }, (_, r) => (
                        <tr key={r}>
                            {Array.from({ length: columns }, (_, c) => (
                                <td key={c}>
                                    <SkeletonBar
                                        className={`h-4 ${c === 0 ? "w-32" : "w-24"}`}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </SkeletonRegion>
    );
}