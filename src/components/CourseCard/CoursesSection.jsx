import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCourses } from "../../services/courses.api";
import CoursesFilters from "./CoursesFilters";
import CoursesGrid from "./CoursesGrid";
import CoursesPagination from "./CoursesPagination";
import CourseGridSkeleton from "../Loaders/CourseGridSkeleton";

export default function CoursesSection() {
    const { user } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Query states
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit,
                search: search || undefined,
                sort: sort || undefined,
                category: category || undefined,
                tags: tags || undefined,
            };

            const res = await getCourses(params);
            setCourses(res.data.courses || []);
            setTotalPages(res.data.totalPages || 1);
        } catch {
            setError("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line
    }, [page, sort, category, tags]);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCourses();
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [sort, category, tags]);

    return (
        <div className="w-full min-w-0 space-y-6">
            <CoursesFilters
                search={search}
                setSearch={setSearch}
                sort={sort}
                setSort={setSort}
                category={category}
                setCategory={setCategory}
                tags={tags}
                setTags={setTags}
                onSearchSubmit={onSearchSubmit}
            />

            {/* Loading State */}
            {loading && <CourseGridSkeleton count={limit} />}

            {/* Error State */}
            {error && (
                <div className="alert alert-error shadow-sm text-xs sm:text-sm">
                    <span className="break-words">{error}</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && courses.length === 0 && (
                <div className="rounded-2xl border border-primary/20 bg-base-200/60 p-6 text-center">
                    <h3 className="text-base sm:text-lg font-semibold text-primary">
                        No courses found
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-base-content/70">
                        Try adjusting your search or filters.
                    </p>
                </div>
            )}

            {/* Courses Content */}
            {!loading && !error && courses.length > 0 && (
                <>
                    <CoursesGrid courses={courses} />

                    {user?.role === "admin" && (
                        <div className="flex justify-center pt-2 sm:pt-4">
                            <Link
                                to="/admin/courses"
                                className="btn btn-primary btn-md sm:btn-wide w-full sm:w-auto"
                            >
                                Manage Courses
                            </Link>
                        </div>
                    )}
                </>
            )}

            <CoursesPagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />
        </div>
    );
}