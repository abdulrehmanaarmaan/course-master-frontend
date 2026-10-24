export default function CoursesPagination({ page, totalPages, setPage }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
            <button
                className="btn btn-xs sm:btn-sm btn-outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
            >
                Prev
            </button>

            <span className="btn btn-xs sm:btn-sm btn-ghost font-semibold cursor-default text-xs sm:text-sm">
                Page {page} of {totalPages}
            </span>

            <button
                className="btn btn-xs sm:btn-sm btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
            >
                Next
            </button>
        </div>
    );
}