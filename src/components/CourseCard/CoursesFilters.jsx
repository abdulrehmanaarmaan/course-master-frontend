export default function CoursesFilters({
    search,
    setSearch,
    sort,
    setSort,
    category,
    setCategory,
    tags,
    setTags,
    onSearchSubmit,
}) {
    return (
        <div className="w-full min-w-0 space-y-3">
            {/* Search Input */}
            <form
                onSubmit={onSearchSubmit}
                className="flex w-full max-w-xl min-w-0 flex-col items-stretch gap-2 sm:flex-row"
            >
                <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md flex-1 min-w-0 w-full border border-base-300 focus:outline-none focus:border-primary"
                    placeholder="Search by title or instructor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    type="submit"
                    className="btn btn-primary btn-sm sm:btn-md shrink-0 w-full sm:w-auto"
                >
                    Search
                </button>
            </form>

            {/* Filter Inputs Grid */}
            <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
                {/* Sort */}
                <select
                    className="select select-bordered select-sm sm:select-md w-full min-w-0 border border-base-300 focus:outline-none focus:border-primary"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="">Sort by price</option>
                    <option value="price_asc">Price Low → High</option>
                    <option value="price_desc">Price High → Low</option>
                </select>

                {/* Category */}
                <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md w-full min-w-0 border border-base-300 focus:outline-none focus:border-primary"
                    placeholder="Category (e.g. web)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                {/* Tags */}
                <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md w-full min-w-0 border border-base-300 focus:outline-none focus:border-primary sm:col-span-2 md:col-span-1"
                    placeholder="Tags (e.g. mern, react)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
            </div>
        </div>
    );
}