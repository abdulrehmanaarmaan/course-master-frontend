import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCourses } from "../../services/courses.api";
import CoursesGrid from "../CourseCard/CoursesGrid";

export default function CoursesPreview() {
    const { user } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch only 6 courses for preview
                const res = await getCourses({ page: 1, limit: 6 });
                setCourses(res.data.courses || []);
            } catch {
                setError("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-base-content">
                        Featured Courses
                    </h2>
                    <p className="text-base-content/70 text-xs sm:text-sm lg:text-base">
                        Discover our most popular courses and start your learning journey today
                    </p>
                </div>
                <Link
                    to="/courses"
                    className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto shrink-0"
                >
                    View All Courses →
                </Link>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}

            {error && (
                <div className="alert alert-error shadow-sm text-xs sm:text-sm">
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && courses.length === 0 && (
                <div className="rounded-xl border border-primary/20 bg-base-200 p-6 text-center">
                    <h3 className="text-base sm:text-lg font-semibold text-primary">
                        No courses available yet
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-base-content/70">
                        Check back soon for new courses!
                    </p>
                </div>
            )}

            {!loading && !error && courses.length > 0 && (
                <div className="space-y-6">
                    <CoursesGrid courses={courses} />
                    <div className="flex justify-center gap-3 pt-2 sm:pt-4">
                        {user?.role === "admin" ? (
                            <Link
                                to="/admin/courses"
                                className="btn btn-primary btn-md sm:btn-wide w-full sm:w-auto"
                            >
                                Manage Courses
                            </Link>
                        ) : (
                            <Link
                                to="/courses"
                                className="btn btn-outline btn-md sm:btn-wide w-full sm:w-auto"
                            >
                                View More Courses
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}