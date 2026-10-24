import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    GraduationCap,
    RefreshCw,
    Trophy,
} from "lucide-react";

import { fetchMyEnrollments } from "../../../store/slices/enrollmentSlice";
import { getQuizStats } from "../../../services/quiz.api";
import { getAssignmentStats } from "../../../services/assignment.api";
import { getCourseById } from "../../../services/courses.api";

// Displays enrolled courses, course progress, quiz results, and assignment results.
export default function StudentEnrolledCourses() {
    const dispatch = useDispatch();

    const { enrollments, loading, error } = useSelector(
        (state) => state.enrollment
    );

    const [expandedCourse, setExpandedCourse] = useState(null);
    const [courseStats, setCourseStats] = useState({});
    const [loadingStats, setLoadingStats] = useState({});

    const lessonTitleCache = useRef({});
    const loadingStatsRef = useRef({});
    const requestIdsRef = useRef({});

    useEffect(() => {
        dispatch(fetchMyEnrollments());
    }, [dispatch]);

    const getResponseData = (response) =>
        response?.data?.data ?? response?.data ?? response;

    const getCourseId = (course) => {
        const id = course?._id ?? course?.id;
        return id ? String(id) : "";
    };

    const createLessonMap = useCallback((courseData) => {
        const syllabus = courseData?.syllabus;

        if (!Array.isArray(syllabus)) {
            return {};
        }

        const map = {};

        syllabus.forEach((module) => {
            if (!Array.isArray(module?.lessons)) {
                return;
            }

            module.lessons.forEach((lesson) => {
                if (lesson?._id) {
                    map[String(lesson._id)] = lesson.title || "Lesson";
                }
            });
        });

        return map;
    }, []);

    const getLessonTitle = useCallback(
        (courseId, lessonId) => {
            const normalizedCourseId = String(courseId ?? "");
            const normalizedLessonId = String(
                lessonId?._id ?? lessonId ?? ""
            );

            if (!normalizedCourseId || !normalizedLessonId) {
                return "Lesson";
            }

            const cacheKey = `${normalizedCourseId}_${normalizedLessonId}`;
            const cachedTitle = lessonTitleCache.current[cacheKey];

            if (cachedTitle) {
                return cachedTitle;
            }

            const lessonMap =
                courseStats[normalizedCourseId]?.lessonMap;

            const title = lessonMap?.[normalizedLessonId] || "Lesson";

            lessonTitleCache.current[cacheKey] = title;

            return title;
        },
        [courseStats]
    );

    const loadCourseStats = useCallback(
        async (courseId, forceRefresh = false) => {
            const normalizedCourseId = String(courseId ?? "");

            if (!normalizedCourseId) {
                return;
            }

            if (loadingStatsRef.current[normalizedCourseId]) {
                return;
            }

            if (courseStats[normalizedCourseId] && !forceRefresh) {
                return;
            }

            loadingStatsRef.current[normalizedCourseId] = true;

            const requestId =
                (requestIdsRef.current[normalizedCourseId] || 0) + 1;

            requestIdsRef.current[normalizedCourseId] = requestId;

            setLoadingStats((previous) => ({
                ...previous,
                [normalizedCourseId]: true,
            }));

            try {
                let courseData = null;

                const [
                    courseResult,
                    quizResult,
                    assignmentResult,
                ] = await Promise.allSettled([
                    getCourseById(normalizedCourseId),
                    getQuizStats(normalizedCourseId),
                    getAssignmentStats(normalizedCourseId),
                ]);

                if (courseResult.status === "fulfilled") {
                    const responseData = getResponseData(
                        courseResult.value
                    );

                    courseData =
                        responseData?.course ??
                        responseData?.courseData ??
                        responseData;
                } else {
                    console.error(
                        "Failed to fetch course:",
                        courseResult.reason
                    );

                    courseData =
                        courseStats[normalizedCourseId]?.courseData ?? null;
                }

                let quizStats = {
                    average: 0,
                    totalQuizzes: 0,
                    submissions: [],
                };

                if (quizResult.status === "fulfilled") {
                    quizStats = {
                        ...quizStats,
                        ...(getResponseData(quizResult.value) ?? {}),
                    };
                } else {
                    console.error(
                        "Quiz stats error:",
                        quizResult.reason
                    );
                }

                let assignmentStats = {
                    average: 0,
                    totalAssignments: 0,
                    reviewedCount: 0,
                    submissions: [],
                };

                if (assignmentResult.status === "fulfilled") {
                    assignmentStats = {
                        ...assignmentStats,
                        ...(getResponseData(assignmentResult.value) ?? {}),
                    };
                } else {
                    console.error(
                        "Assignment stats error:",
                        assignmentResult.reason
                    );
                }

                if (
                    requestIdsRef.current[normalizedCourseId] !== requestId
                ) {
                    return;
                }

                const lessonMap = createLessonMap(courseData);

                Object.keys(lessonTitleCache.current).forEach((key) => {
                    if (key.startsWith(`${normalizedCourseId}_`)) {
                        delete lessonTitleCache.current[key];
                    }
                });

                setCourseStats((previous) => ({
                    ...previous,
                    [normalizedCourseId]: {
                        quizStats,
                        assignmentStats,
                        courseData,
                        lessonMap,
                    },
                }));
            } catch (err) {
                console.error("Failed to load course stats:", err);
            } finally {
                if (
                    requestIdsRef.current[normalizedCourseId] === requestId
                ) {
                    loadingStatsRef.current[normalizedCourseId] = false;

                    setLoadingStats((previous) => ({
                        ...previous,
                        [normalizedCourseId]: false,
                    }));
                }
            }
        },
        [courseStats, createLessonMap]
    );

    const handleExpandCourse = (courseId) => {
        const normalizedCourseId = String(courseId);

        if (expandedCourse === normalizedCourseId) {
            setExpandedCourse(null);
            return;
        }

        setExpandedCourse(normalizedCourseId);
        loadCourseStats(normalizedCourseId);
    };

    const handleRefreshStats = (courseId) => {
        const normalizedCourseId = String(courseId);

        // Invalidate any previous request so stale responses cannot win.
        requestIdsRef.current[normalizedCourseId] =
            (requestIdsRef.current[normalizedCourseId] || 0) + 1;

        loadingStatsRef.current[normalizedCourseId] = false;

        Object.keys(lessonTitleCache.current).forEach((key) => {
            if (key.startsWith(`${normalizedCourseId}_`)) {
                delete lessonTitleCache.current[key];
            }
        });

        setCourseStats((previous) => {
            const updatedStats = { ...previous };
            delete updatedStats[normalizedCourseId];
            return updatedStats;
        });

        loadCourseStats(normalizedCourseId, true);
    };

    const formatDate = (value) => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? null
            : date.toLocaleDateString();
    };

    const formatDateTime = (value) => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    };

    const validEnrollments = (enrollments || []).filter((enrollment) =>
        getCourseId(enrollment?.course)
    );

    if (loading) {
        return (
            <main className="flex min-h-[60vh] min-w-0 flex-1 items-center justify-center px-4">
                <span
                    className="loading loading-spinner loading-lg text-primary"
                    role="status"
                    aria-label="Loading your courses"
                />
            </main>
        );
    }

    return (
        <main className="min-w-0 flex-1">
            {/* Desktop page header */}
            <div className="hidden items-center justify-between gap-4 border-b border-base-300 bg-base-100 px-6 py-4 lg:flex xl:px-8">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold">
                        Student Dashboard
                    </h1>

                    <p className="mt-0.5 text-sm text-base-content/60">
                        Manage your courses and track your progress.
                    </p>
                </div>

                <Link
                    to="/courses"
                    className="btn btn-outline btn-sm shrink-0"
                >
                    <BookOpen className="h-4 w-4" />
                    Browse Courses
                </Link>
            </div>

            <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-8">
                {/* Page Heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-2xl font-bold sm:text-3xl">
                            My Courses
                        </h2>

                        <p className="mt-1 text-sm text-base-content/60">
                            Continue learning and review your results.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="btn btn-outline btn-sm w-full sm:w-auto lg:hidden"
                    >
                        <BookOpen className="h-4 w-4" />
                        Browse More Courses
                    </Link>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="alert alert-error break-words"
                    >
                        <span>{error}</span>
                    </div>
                )}

                {validEnrollments.length === 0 ? (
                    <div className="card border border-base-300 bg-base-100 shadow-sm">
                        <div className="card-body items-center px-4 py-12 text-center sm:px-8">
                            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <BookOpen className="h-8 w-8" />
                            </div>

                            <h3 className="text-xl font-bold">
                                No courses enrolled yet
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-base-content/60">
                                Start your learning journey by
                                exploring the available courses.
                            </p>

                            <Link
                                to="/"
                                className="btn btn-primary mt-4"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {validEnrollments.map((enrollment) => {
                            const courseId = getCourseId(
                                enrollment.course
                            );

                            const isExpanded =
                                expandedCourse === courseId;

                            const stats = courseStats[courseId];

                            const isLoading = Boolean(
                                loadingStats[courseId]
                            );

                            const completedLessons = Array.isArray(
                                enrollment.progress?.completedLessons
                            )
                                ? enrollment.progress.completedLessons
                                : [];

                            const completedCount =
                                completedLessons.length;

                            const syllabus =
                                stats?.courseData?.syllabus;

                            const totalLessons = Array.isArray(
                                syllabus
                            )
                                ? syllabus.reduce(
                                    (total, module) =>
                                        total +
                                        (Array.isArray(
                                            module?.lessons
                                        )
                                            ? module.lessons.length
                                            : 0),
                                    0
                                )
                                : 0;

                            const fallbackPercent =
                                totalLessons > 0
                                    ? (completedCount /
                                        totalLessons) *
                                    100
                                    : 0;

                            const rawPercent =
                                enrollment.progress?.percent ??
                                fallbackPercent;

                            const progressPercent = Math.min(
                                100,
                                Math.max(
                                    0,
                                    Number.isFinite(
                                        Number(rawPercent)
                                    )
                                        ? Math.round(
                                            Number(rawPercent)
                                        )
                                        : 0
                                )
                            );

                            const quizStats = stats?.quizStats;
                            const assignmentStats =
                                stats?.assignmentStats;

                            const quizCount =
                                Number(quizStats?.totalQuizzes) || 0;

                            const assignmentCount =
                                Number(
                                    assignmentStats?.totalAssignments
                                ) || 0;

                            const quizSubmissions = Array.isArray(
                                quizStats?.submissions
                            )
                                ? quizStats.submissions
                                : [];

                            const assignmentSubmissions =
                                Array.isArray(
                                    assignmentStats?.submissions
                                )
                                    ? assignmentStats.submissions
                                    : [];

                            const reviewedCount =
                                Number(
                                    assignmentStats?.reviewedCount
                                ) || 0;

                            const quizAverage =
                                Number(quizStats?.average) || 0;

                            const assignmentAverage =
                                Number(assignmentStats?.average) || 0;

                            const overallCount =
                                quizCount + reviewedCount;

                            const overallGrade =
                                overallCount > 0
                                    ? Math.round(
                                        (quizAverage * quizCount +
                                            assignmentAverage *
                                            reviewedCount) /
                                        overallCount
                                    )
                                    : null;

                            return (
                                <article
                                    key={enrollment._id || courseId}
                                    className="min-w-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="p-3 sm:p-6">
                                        {/* Course Header */}
                                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                                                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="break-words text-lg font-bold sm:text-xl">
                                                        {enrollment.course
                                                            ?.title ||
                                                            "Untitled Course"}
                                                    </h3>

                                                    <p className="mt-1 break-words text-sm text-base-content/60">
                                                        Instructor:{" "}
                                                        {enrollment
                                                            .course
                                                            ?.instructorName ||
                                                            "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid w-full grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:w-auto sm:shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleExpandCourse(
                                                            courseId
                                                        )
                                                    }
                                                    aria-expanded={
                                                        isExpanded
                                                    }
                                                    className="btn btn-outline btn-sm min-w-0"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4 shrink-0" />
                                                            Hide Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4 shrink-0" />
                                                            Details
                                                        </>
                                                    )}
                                                </button>

                                                <Link
                                                    to={`/courses/${courseId}/player`}
                                                    className="btn btn-primary btn-sm min-w-0"
                                                >
                                                    Continue Learning
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Course Progress */}
                                        <div className="mt-5 rounded-xl border border-base-300 bg-base-200/60 p-3 sm:p-5">
                                            <div className="mb-3 flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold">
                                                        Course Progress
                                                    </p>

                                                    {totalLessons > 0 ? (
                                                        <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                                                            {Math.min(
                                                                completedCount,
                                                                totalLessons
                                                            )}{" "}
                                                            of{" "}
                                                            {totalLessons}{" "}
                                                            lessons
                                                            completed
                                                        </p>
                                                    ) : (
                                                        <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                                                            {
                                                                completedCount
                                                            }{" "}
                                                            lesson
                                                            {completedCount !==
                                                                1
                                                                ? "s"
                                                                : ""}{" "}
                                                            completed
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="text-2xl font-bold text-primary sm:text-3xl">
                                                    {progressPercent}%
                                                </p>
                                            </div>

                                            <progress
                                                className="progress progress-primary h-3 w-full"
                                                value={progressPercent}
                                                max={100}
                                                aria-label={`Course progress: ${progressPercent}%`}
                                            />

                                            {isExpanded && stats && (
                                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-base-300 pt-3 text-xs text-base-content/70 sm:text-sm">
                                                    <span className="font-medium">
                                                        Course Content
                                                    </span>

                                                    {quizCount > 0 && (
                                                        <span>
                                                            {quizCount}{" "}
                                                            Quiz
                                                            {quizCount !==
                                                                1
                                                                ? "zes"
                                                                : ""}
                                                        </span>
                                                    )}

                                                    {assignmentCount >
                                                        0 && (
                                                            <span>
                                                                {
                                                                    assignmentCount
                                                                }{" "}
                                                                Assignment
                                                                {assignmentCount !==
                                                                    1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Course Details */}
                                        {isExpanded && (
                                            <section className="mt-6 min-w-0 space-y-5 border-t border-base-300 pt-5">
                                                {isLoading ? (
                                                    <div className="flex min-h-40 items-center justify-center">
                                                        <span
                                                            className="loading loading-spinner loading-lg text-primary"
                                                            role="status"
                                                            aria-label="Loading course statistics"
                                                        />
                                                    </div>
                                                ) : stats ? (
                                                    <>
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRefreshStats(
                                                                        courseId
                                                                    )
                                                                }
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                className="btn btn-outline btn-sm max-w-full"
                                                            >
                                                                <RefreshCw className="h-4 w-4 shrink-0" />
                                                                Refresh Stats
                                                            </button>
                                                        </div>

                                                        {/* Statistics Cards */}
                                                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                            <div className="min-w-0 rounded-xl bg-primary p-4 text-primary-content sm:p-5">
                                                                <div className="flex items-center gap-2">
                                                                    <Trophy className="h-5 w-5 shrink-0" />
                                                                    <h4 className="text-sm font-semibold opacity-90">
                                                                        Quiz Average
                                                                    </h4>
                                                                </div>

                                                                <p className="mt-3 text-3xl font-bold">
                                                                    {
                                                                        quizAverage
                                                                    }
                                                                    %
                                                                </p>

                                                                <p className="mt-1 text-xs opacity-75">
                                                                    {
                                                                        quizCount
                                                                    }{" "}
                                                                    quiz
                                                                    {quizCount !==
                                                                        1
                                                                        ? "zes"
                                                                        : ""}{" "}
                                                                    taken
                                                                </p>
                                                            </div>

                                                            <div className="min-w-0 rounded-xl bg-secondary p-4 text-secondary-content sm:p-5">
                                                                <div className="flex items-center gap-2">
                                                                    <ClipboardCheck className="h-5 w-5 shrink-0" />
                                                                    <h4 className="text-sm font-semibold opacity-90">
                                                                        Assignment Average
                                                                    </h4>
                                                                </div>

                                                                <p className="mt-3 text-3xl font-bold">
                                                                    {
                                                                        assignmentAverage
                                                                    }
                                                                    %
                                                                </p>

                                                                <p className="mt-1 text-xs opacity-75">
                                                                    {
                                                                        reviewedCount
                                                                    }{" "}
                                                                    of{" "}
                                                                    {
                                                                        assignmentCount
                                                                    }{" "}
                                                                    reviewed
                                                                </p>
                                                            </div>

                                                            <div className="min-w-0 rounded-xl bg-accent p-4 text-accent-content sm:col-span-2 sm:p-5 xl:col-span-1">
                                                                <div className="flex items-center gap-2">
                                                                    <GraduationCap className="h-5 w-5 shrink-0" />
                                                                    <h4 className="text-sm font-semibold opacity-90">
                                                                        Overall Grade
                                                                    </h4>
                                                                </div>

                                                                <p className="mt-3 text-3xl font-bold">
                                                                    {overallGrade ===
                                                                        null
                                                                        ? "N/A"
                                                                        : `${overallGrade}%`}
                                                                </p>

                                                                <p className="mt-1 text-xs opacity-75">
                                                                    Weighted average
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Quiz Submissions */}
                                                        <div className="min-w-0 space-y-3">
                                                            <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                                                                <h4 className="text-base font-bold sm:text-lg">
                                                                    Quiz Results
                                                                </h4>

                                                                <span className="badge badge-primary badge-outline max-w-full">
                                                                    {
                                                                        quizSubmissions.length
                                                                    }{" "}
                                                                    submission
                                                                    {quizSubmissions.length !==
                                                                        1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            </div>

                                                            {quizSubmissions.length >
                                                                0 ? (
                                                                <div className="space-y-3">
                                                                    {quizSubmissions.map(
                                                                        (
                                                                            quiz,
                                                                            index
                                                                        ) => {
                                                                            const lessonTitle =
                                                                                getLessonTitle(
                                                                                    courseId,
                                                                                    quiz.lessonId
                                                                                );

                                                                            const submittedAt =
                                                                                formatDateTime(
                                                                                    quiz.submittedAt
                                                                                );

                                                                            const percent =
                                                                                Number(
                                                                                    quiz.percent
                                                                                ) ||
                                                                                0;

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        quiz._id ||
                                                                                        `${quiz.lessonId}-${index}`
                                                                                    }
                                                                                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-base-300 bg-base-200/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                                                                                >
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="break-words font-semibold">
                                                                                            {
                                                                                                lessonTitle
                                                                                            }
                                                                                        </p>

                                                                                        <p className="mt-1 break-words text-sm text-base-content/70">
                                                                                            {
                                                                                                quiz.score ??
                                                                                                0
                                                                                            }{" "}
                                                                                            out of{" "}
                                                                                            {
                                                                                                quiz.total ??
                                                                                                0
                                                                                            }{" "}
                                                                                            questions correct
                                                                                        </p>

                                                                                        {submittedAt && (
                                                                                            <p className="mt-1 break-words text-xs text-base-content/50">
                                                                                                Submitted:{" "}
                                                                                                {
                                                                                                    submittedAt
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                                                                                        <span
                                                                                            className={`text-2xl font-bold ${percent >=
                                                                                                70
                                                                                                ? "text-success"
                                                                                                : percent >=
                                                                                                    50
                                                                                                    ? "text-warning"
                                                                                                    : "text-error"
                                                                                                }`}
                                                                                        >
                                                                                            {
                                                                                                percent
                                                                                            }
                                                                                            %
                                                                                        </span>

                                                                                        <span className="text-xs text-base-content/60">
                                                                                            {percent >=
                                                                                                70
                                                                                                ? "Excellent!"
                                                                                                : percent >=
                                                                                                    50
                                                                                                    ? "Good progress"
                                                                                                    : "Keep practicing"}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-sm text-base-content/70">
                                                                    No quiz submissions yet.
                                                                    Complete quizzes to see your results here.
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Assignment Submissions */}
                                                        <div className="min-w-0 space-y-3">
                                                            <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                                                                <h4 className="text-base font-bold sm:text-lg">
                                                                    Assignment Results
                                                                </h4>

                                                                <span className="badge badge-secondary badge-outline max-w-full">
                                                                    {
                                                                        assignmentSubmissions.length
                                                                    }{" "}
                                                                    submission
                                                                    {assignmentSubmissions.length !==
                                                                        1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            </div>

                                                            {assignmentSubmissions.length >
                                                                0 ? (
                                                                <div className="space-y-3">
                                                                    {assignmentSubmissions.map(
                                                                        (
                                                                            assignment,
                                                                            index
                                                                        ) => {
                                                                            const lessonTitle =
                                                                                getLessonTitle(
                                                                                    courseId,
                                                                                    assignment.lessonId
                                                                                );

                                                                            const submittedDate =
                                                                                formatDate(
                                                                                    assignment.submittedAt
                                                                                );

                                                                            const reviewedDate =
                                                                                formatDate(
                                                                                    assignment.reviewedAt
                                                                                );

                                                                            const grade =
                                                                                assignment.grade;

                                                                            return (
                                                                                <article
                                                                                    key={
                                                                                        assignment._id ||
                                                                                        `${assignment.lessonId}-${index}`
                                                                                    }
                                                                                    className="min-w-0 rounded-xl border border-base-300 bg-base-200/50 p-3 sm:p-4"
                                                                                >
                                                                                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p className="break-words font-semibold">
                                                                                                {
                                                                                                    lessonTitle
                                                                                                }
                                                                                            </p>

                                                                                            {submittedDate && (
                                                                                                <p className="mt-1 break-words text-xs text-base-content/60">
                                                                                                    Submitted:{" "}
                                                                                                    {
                                                                                                        submittedDate
                                                                                                    }
                                                                                                </p>
                                                                                            )}

                                                                                            {assignment.status ===
                                                                                                "reviewed" &&
                                                                                                reviewedDate && (
                                                                                                    <p className="mt-1 break-words text-xs text-base-content/60">
                                                                                                        Reviewed:{" "}
                                                                                                        {
                                                                                                            reviewedDate
                                                                                                        }
                                                                                                    </p>
                                                                                                )}
                                                                                        </div>

                                                                                        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                                                                                            <span
                                                                                                className={`badge ${assignment.status ===
                                                                                                    "reviewed"
                                                                                                    ? "badge-success"
                                                                                                    : "badge-warning"
                                                                                                    }`}
                                                                                            >
                                                                                                {assignment.status ===
                                                                                                    "reviewed"
                                                                                                    ? "Reviewed"
                                                                                                    : "Pending"}
                                                                                            </span>

                                                                                            {grade !==
                                                                                                null &&
                                                                                                grade !==
                                                                                                undefined && (
                                                                                                    <span
                                                                                                        className={`text-xl font-bold ${Number(
                                                                                                            grade
                                                                                                        ) >=
                                                                                                            70
                                                                                                            ? "text-success"
                                                                                                            : Number(
                                                                                                                grade
                                                                                                            ) >=
                                                                                                                50
                                                                                                                ? "text-warning"
                                                                                                                : "text-error"
                                                                                                            }`}
                                                                                                    >
                                                                                                        {
                                                                                                            grade
                                                                                                        }
                                                                                                        %
                                                                                                    </span>
                                                                                                )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="mt-4 min-w-0">
                                                                                        <p className="mb-1 text-sm font-semibold">
                                                                                            Submission
                                                                                        </p>

                                                                                        {assignment.answerType ===
                                                                                            "link" ? (
                                                                                            assignment.answer ? (
                                                                                                <a
                                                                                                    href={
                                                                                                        assignment.answer
                                                                                                    }
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="break-all text-sm text-primary hover:underline"
                                                                                                >
                                                                                                    {
                                                                                                        assignment.answer
                                                                                                    }
                                                                                                </a>
                                                                                            ) : (
                                                                                                <p className="text-sm text-base-content/60">
                                                                                                    No link provided.
                                                                                                </p>
                                                                                            )
                                                                                        ) : (
                                                                                            <p className="whitespace-pre-wrap break-words rounded-lg bg-base-100 p-3 text-sm text-base-content/80">
                                                                                                {assignment.answer ||
                                                                                                    "No answer provided."}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>

                                                                                    {assignment.reviewNotes && (
                                                                                        <div className="mt-4 min-w-0 rounded-lg border border-info/20 bg-info/10 p-3">
                                                                                            <p className="mb-1 text-sm font-semibold text-info">
                                                                                                Feedback from{" "}
                                                                                                {assignment
                                                                                                    .reviewer
                                                                                                    ?.name ||
                                                                                                    "Admin"}
                                                                                            </p>

                                                                                            <p className="whitespace-pre-wrap break-words text-sm">
                                                                                                {
                                                                                                    assignment.reviewNotes
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </article>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-sm text-base-content/70">
                                                                    No assignment submissions yet.
                                                                    Submit an assignment to see marks and feedback here.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="py-8 text-center text-sm text-base-content/60">
                                                        Course statistics could not be loaded.
                                                        Please refresh and try again.
                                                    </div>
                                                )}
                                            </section>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
