import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Clock, X } from "lucide-react";

import { getCourseById } from "../../services/courses.api";
import {
    completeLesson,
    getMyEnrollments,
} from "../../services/enrollment.api";
import {
    getMyQuizSubmissions,
    submitQuiz,
} from "../../services/quiz.api";
import { submitAssignment } from "../../services/assignment.api";

import LearningHeader from "./components/LearningHeader";

const getResponseData = (response) =>
    response?.data?.data ?? response?.data ?? response;

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id ?? value.id ?? "");
};

const formatLessonDuration = (duration) => {
    if (
        duration === undefined ||
        duration === null ||
        String(duration).trim() === ""
    ) {
        return "Duration hasn't been specified yet.";
    }

    if (typeof duration === "number" && Number.isFinite(duration)) {
        return duration === 1 ? "1 minute" : `${duration} minutes`;
    }

    const value = String(duration).trim();

    if (/^\d+(?:\.\d+)?$/.test(value)) {
        const numericDuration = Number(value);

        return numericDuration === 1
            ? "1 minute"
            : `${numericDuration} minutes`;
    }

    return value;
};

const convertToEmbedUrl = (url) => {
    if (!url) return "";

    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();

        if (
            hostname === "youtu.be" ||
            hostname.endsWith(".youtu.be")
        ) {
            const videoId = parsedUrl.pathname
                .split("/")
                .filter(Boolean)[0];

            return videoId
                ? `https://www.youtube.com/embed/${videoId}`
                : url;
        }

        if (
            hostname === "youtube.com" ||
            hostname.endsWith(".youtube.com")
        ) {
            if (parsedUrl.pathname === "/watch") {
                const videoId = parsedUrl.searchParams.get("v");

                return videoId
                    ? `https://www.youtube.com/embed/${videoId}`
                    : url;
            }

            const match = parsedUrl.pathname.match(
                /^\/(?:embed|v|shorts)\/([^/]+)/
            );

            if (match) {
                return `https://www.youtube.com/embed/${match[1]}`;
            }
        }
    } catch {
        // Invalid or non-URL values are handled by the video player UI.
    }

    return url;
};

const isDirectVideoUrl = (url) =>
    /\.(mp4|webm|ogg)(?:$|[?#])/i.test(url || "");

export default function StudentCoursePlayer() {
    const { courseId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(
        searchParams.get("lessonId") || ""
    );
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [error, setError] = useState("");
    const [expandedModules, setExpandedModules] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);

    // Tracks which lesson's duration panel is currently open.
    const [durationOpenLessonKey, setDurationOpenLessonKey] =
        useState("");

    const modules = useMemo(
        () => (Array.isArray(course?.syllabus) ? course.syllabus : []),
        [course]
    );

    const lessons = useMemo(
        () =>
            modules.flatMap((module, moduleIndex) =>
                (
                    Array.isArray(module?.lessons)
                        ? module.lessons
                        : []
                ).map((lesson, lessonIndex) => ({
                    ...lesson,
                    _playerId: getId(lesson),
                    _moduleId:
                        getId(module) || `module-${moduleIndex}`,
                    _moduleTitle:
                        module.title || `Module ${moduleIndex + 1}`,
                    _moduleIndex: moduleIndex,
                    _lessonIndex: lessonIndex,
                }))
            ),
        [modules]
    );

    const completedLessonIds = useMemo(
        () =>
            new Set(
                (
                    enrollment?.progress?.completedLessons || []
                )
                    .map(getId)
                    .filter(Boolean)
            ),
        [enrollment]
    );

    const completedCount = lessons.filter(
        (lesson) =>
            lesson._playerId &&
            completedLessonIds.has(lesson._playerId)
    ).length;

    const progressPercent =
        lessons.length > 0
            ? Math.min(
                100,
                Math.round(
                    (completedCount / lessons.length) * 100
                )
            )
            : 0;

    const selectedLesson = lessons.find(
        (lesson) => lesson._playerId === selectedLessonId
    );

    const selectedIndex = lessons.findIndex(
        (lesson) => lesson._playerId === selectedLessonId
    );

    const loadPlayer = useCallback(async (signal) => {
        setLoading(true);
        setError("");

        try {
            if (!courseId) {
                throw new Error("Course ID is missing from the URL.");
            }

            const [courseResponse, enrollmentResponse] =
                await Promise.all([
                    getCourseById(courseId),
                    getMyEnrollments(),
                ]);

            if (signal?.aborted) return;

            const courseData = getResponseData(courseResponse);
            const enrollmentData =
                getResponseData(enrollmentResponse);

            if (
                !courseData ||
                getId(courseData) !== String(courseId)
            ) {
                throw new Error("This course could not be found.");
            }

            if (!Array.isArray(enrollmentData)) {
                throw new Error("Unable to load your enrollments.");
            }

            const matchingEnrollment = enrollmentData.find(
                (item) =>
                    getId(item.course) === String(courseId)
            );

            if (!matchingEnrollment) {
                throw new Error(
                    "You are not enrolled in this course."
                );
            }

            setCourse(courseData);
            setEnrollment(matchingEnrollment);
        } catch (err) {
            if (signal?.aborted) return;

            console.error("Failed to load course player:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load this course."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [courseId]);

    useEffect(() => {
        const controller = new AbortController();

        loadPlayer(controller.signal);

        return () => controller.abort();
    }, [loadPlayer]);

    useEffect(() => {
        if (!lessons.length) {
            if (selectedLessonId) {
                setSelectedLessonId("");
            }

            return;
        }

        const requestedId = searchParams.get("lessonId");

        const requestedLesson = lessons.find(
            (lesson) =>
                lesson._playerId === requestedId && requestedId
        );

        const currentLesson = lessons.find(
            (lesson) =>
                lesson._playerId === selectedLessonId &&
                selectedLessonId
        );

        if (requestedLesson) {
            if (
                selectedLessonId !== requestedLesson._playerId
            ) {
                setSelectedLessonId(requestedLesson._playerId);
            }

            return;
        }

        if (!currentLesson) {
            const firstIncomplete = lessons.find(
                (lesson) =>
                    lesson._playerId &&
                    !completedLessonIds.has(lesson._playerId)
            );

            const nextLesson =
                firstIncomplete ||
                lessons.find((lesson) => lesson._playerId);

            const nextId = nextLesson?._playerId || "";

            if (selectedLessonId !== nextId) {
                setSelectedLessonId(nextId);
            }

            if (nextId && requestedId !== nextId) {
                setSearchParams(
                    { lessonId: nextId },
                    { replace: true }
                );
            } else if (!nextId && requestedId) {
                setSearchParams({}, { replace: true });
            }
        }
    }, [
        lessons,
        searchParams,
        selectedLessonId,
        completedLessonIds,
        setSearchParams,
    ]);

    useEffect(() => {
        if (!selectedLesson) return;

        setExpandedModules((previous) => ({
            ...previous,
            [selectedLesson._moduleId]: true,
        }));
    }, [selectedLesson]);

    const selectLesson = useCallback(
        (lessonId) => {
            if (!lessonId) return;

            setDurationOpenLessonKey("");
            setSelectedLessonId(lessonId);
            setSearchParams(
                { lessonId },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const toggleModule = useCallback((moduleId) => {
        setExpandedModules((previous) => ({
            ...previous,
            [moduleId]: !(previous[moduleId] ?? true),
        }));
    }, []);

    const toggleLessonDuration = useCallback((lessonKey) => {
        setDurationOpenLessonKey((currentKey) =>
            currentKey === lessonKey ? "" : lessonKey
        );
    }, []);

    const handleCompleteLesson = useCallback(async () => {
        if (
            !selectedLesson?._playerId ||
            !enrollment?._id ||
            completing ||
            completedLessonIds.has(selectedLesson._playerId)
        ) {
            return;
        }

        setCompleting(true);
        setError("");

        try {
            const response = await completeLesson(
                enrollment._id,
                selectedLesson._playerId
            );

            const updatedEnrollment = getResponseData(response);

            if (
                updatedEnrollment &&
                getId(updatedEnrollment) === getId(enrollment)
            ) {
                setEnrollment(updatedEnrollment);
            } else {
                setEnrollment((previous) => {
                    if (!previous) return previous;

                    const ids = new Set(
                        (
                            previous.progress?.completedLessons || []
                        )
                            .map(getId)
                            .filter(Boolean)
                    );

                    ids.add(selectedLesson._playerId);

                    const total = lessons.filter(
                        (lesson) => lesson._playerId
                    ).length;

                    return {
                        ...previous,
                        progress: {
                            ...previous.progress,
                            completedLessons: [...ids],
                            percent: total
                                ? Math.min(
                                    100,
                                    Math.round(
                                        (ids.size / total) * 100
                                    )
                                )
                                : 0,
                        },
                    };
                });
            }

            // Refresh saved progress from the API.
            try {
                const refreshResponse = await getMyEnrollments();
                const list = getResponseData(refreshResponse);

                if (Array.isArray(list)) {
                    const refreshed = list.find(
                        (item) =>
                            getId(item.course) === String(courseId)
                    );

                    if (refreshed) {
                        setEnrollment(refreshed);
                    }
                }
            } catch (refreshError) {
                console.error(
                    "Lesson completion was saved, but progress refresh failed:",
                    refreshError
                );
            }
        } catch (err) {
            console.error("Failed to complete lesson:", err);

            setError(
                err?.response?.data?.message ||
                "Could not save lesson progress. Please try again."
            );
        } finally {
            setCompleting(false);
        }
    }, [
        selectedLesson,
        enrollment,
        completing,
        completedLessonIds,
        lessons,
        courseId,
    ]);

    const goToAdjacentLesson = useCallback(
        (direction) => {
            const nextIndex = selectedIndex + direction;

            if (
                nextIndex < 0 ||
                nextIndex >= lessons.length
            ) {
                return;
            }

            selectLesson(lessons[nextIndex]._playerId);
        },
        [selectedIndex, lessons, selectLesson]
    );

    const videoUrl = selectedLesson?.videoUrl || "";
    const embedUrl = convertToEmbedUrl(videoUrl);

    const isCompleted =
        !!selectedLesson &&
        completedLessonIds.has(selectedLesson._playerId);

    if (loading) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-base-200 px-4">
                <div
                    className="flex flex-col items-center gap-3 text-center sm:flex-row"
                    role="status"
                    aria-live="polite"
                >
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <span className="text-sm sm:text-base">
                        Loading your course...
                    </span>
                </div>
            </main>
        );
    }

    if (error && !course) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-base-200 px-4 py-8">
                <section className="w-full max-w-lg rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8">
                    <h1 className="text-xl font-bold">
                        Unable to open course
                    </h1>

                    <div
                        role="alert"
                        className="alert alert-error mt-4 break-words"
                    >
                        <span>{error}</span>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 min-[420px]:flex-row">
                        <button
                            type="button"
                            className="btn btn-primary w-full min-[420px]:w-auto"
                            onClick={() => loadPlayer()}
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline w-full min-[420px]:w-auto"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    if (!course) return null;

    return (
        <main className="min-h-dvh overflow-x-clip bg-base-200 text-base-content">
            <LearningHeader
                courseId={courseId}
                courseTitle={course.title || "Course Player"}
                progress={progressPercent}
            />

            {error && (
                <div className="mx-auto w-full max-w-screen-2xl px-3 pt-4 sm:px-6 lg:px-8">
                    <div
                        role="alert"
                        className="alert alert-error break-words"
                    >
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Main lesson content */}
                <section className="min-w-0 space-y-4 sm:space-y-6">
                    {/* Responsive video player */}
                    <div className="min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
                        {selectedLesson ? (
                            videoUrl ? (
                                isDirectVideoUrl(videoUrl) ? (
                                    <video
                                        key={videoUrl}
                                        className="aspect-video w-full bg-black object-contain"
                                        src={videoUrl}
                                        controls
                                        playsInline
                                        preload="metadata"
                                    >
                                        Your browser does not support video playback.
                                    </video>
                                ) : (
                                    <div className="relative aspect-video w-full bg-black">
                                        <iframe
                                            key={embedUrl}
                                            className="absolute inset-0 h-full w-full"
                                            src={embedUrl}
                                            title={
                                                selectedLesson.title ||
                                                "Course lesson video"
                                            }
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            referrerPolicy="strict-origin-when-cross-origin"
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="flex aspect-video items-center justify-center bg-neutral px-4 py-8 text-center text-neutral-content sm:px-8">
                                    <div className="max-w-md">
                                        <h2 className="text-lg font-semibold">
                                            No video available
                                        </h2>
                                        <p className="mt-2 text-sm opacity-80">
                                            There is no video attached to this lesson yet.
                                        </p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex min-h-56 items-center justify-center px-5 py-10 text-center sm:min-h-72">
                                <div className="max-w-md">
                                    <h2 className="text-lg font-semibold">
                                        No lessons available yet
                                    </h2>
                                    <p className="mt-2 text-sm text-base-content/70">
                                        This course does not currently contain any lessons.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedLesson && (
                        <article className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6 lg:p-7">
                            <p className="break-words text-sm text-base-content/60">
                                {selectedLesson._moduleTitle}
                            </p>

                            <h1 className="mt-1 break-words text-xl font-bold sm:text-2xl lg:text-3xl">
                                {selectedLesson.title ||
                                    "Untitled lesson"}
                            </h1>

                            {selectedLesson.description && (
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-base-content/75 sm:text-base">
                                    {selectedLesson.description}
                                </p>
                            )}

                            {selectedLesson.liveClassLink && (
                                <div className="mt-5 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-5">
                                    <h2 className="font-semibold text-info">
                                        Live Class Available
                                    </h2>

                                    {selectedLesson.liveClassDate && (
                                        <p className="mt-2 break-words text-sm">
                                            <strong>Scheduled:</strong>{" "}
                                            {new Date(
                                                selectedLesson.liveClassDate
                                            ).toLocaleString()}
                                        </p>
                                    )}

                                    <a
                                        href={selectedLesson.liveClassLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-info btn-sm mt-3 w-full min-[420px]:w-auto"
                                    >
                                        Join Live Class
                                    </a>
                                </div>
                            )}

                            {/* Lesson navigation and completion controls */}
                            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-base-300 pt-5 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3">
                                <button
                                    type="button"
                                    className="btn btn-outline w-full min-w-0"
                                    onClick={() =>
                                        goToAdjacentLesson(-1)
                                    }
                                    disabled={
                                        selectedIndex <= 0 ||
                                        completing
                                    }
                                >
                                    <span aria-hidden="true">←</span>
                                    <span>Previous Lesson</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn w-full min-w-0 sm:col-span-2 lg:col-span-1 ${isCompleted
                                        ? "btn-success"
                                        : "btn-primary"
                                        }`}
                                    onClick={handleCompleteLesson}
                                    disabled={
                                        completing ||
                                        isCompleted ||
                                        !selectedLesson._playerId
                                    }
                                >
                                    {completing
                                        ? "Saving progress..."
                                        : isCompleted
                                            ? "✓ Completed"
                                            : "Mark as Complete"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline w-full min-w-0"
                                    onClick={() =>
                                        goToAdjacentLesson(1)
                                    }
                                    disabled={
                                        selectedIndex < 0 ||
                                        selectedIndex >=
                                        lessons.length - 1 ||
                                        completing
                                    }
                                >
                                    <span>Next Lesson</span>
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>

                            {selectedLesson.assignmentPrompt && (
                                <AssignmentSubmission
                                    key={`${courseId}-${selectedLesson._playerId}-assignment-${refreshKey}`}
                                    courseId={courseId}
                                    lessonId={selectedLesson._playerId}
                                    prompt={
                                        selectedLesson.assignmentPrompt
                                    }
                                    onComplete={handleCompleteLesson}
                                />
                            )}

                            {Array.isArray(selectedLesson.quiz) &&
                                selectedLesson.quiz.length > 0 && (
                                    <QuizInterface
                                        key={`${courseId}-${selectedLesson._playerId}-quiz-${refreshKey}`}
                                        quiz={selectedLesson.quiz}
                                        courseId={courseId}
                                        lessonId={selectedLesson._playerId}
                                        onComplete={handleCompleteLesson}
                                    />
                                )}
                        </article>
                    )}
                </section>

                {/* Module sidebar: moves below the lesson on mobile */}
                <aside className="min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
                    <div className="border-b border-base-300 p-4 sm:p-5">
                        <h2 className="text-lg font-bold">
                            Modules & Lessons
                        </h2>

                        <p className="mt-1 text-sm text-base-content/60">
                            {modules.length} modules · {lessons.length} lessons
                        </p>

                        {lessons.length > 0 && (
                            <div className="mt-3">
                                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-base-content/60">
                                    <span>Overall progress</span>
                                    <span className="font-semibold text-primary">
                                        {progressPercent}%
                                    </span>
                                </div>

                                <progress
                                    className="progress progress-primary h-2 w-full"
                                    value={progressPercent}
                                    max={100}
                                    aria-label={`Overall course progress: ${progressPercent}%`}
                                />
                            </div>
                        )}
                    </div>

                    {modules.length === 0 ? (
                        <p className="p-5 text-sm text-base-content/70">
                            No course modules are available.
                        </p>
                    ) : (
                        <div className="divide-y divide-base-300">
                            {modules.map((module, moduleIndex) => {
                                const moduleId =
                                    getId(module) ||
                                    `module-${moduleIndex}`;

                                const moduleLessons = lessons.filter(
                                    (lesson) =>
                                        lesson._moduleId === moduleId
                                );

                                const expanded =
                                    expandedModules[moduleId] ?? true;

                                const moduleCompleted =
                                    moduleLessons.length > 0 &&
                                    moduleLessons.every(
                                        (lesson) =>
                                            lesson._playerId &&
                                            completedLessonIds.has(
                                                lesson._playerId
                                            )
                                    );

                                return (
                                    <section key={moduleId}>
                                        <button
                                            type="button"
                                            className="flex w-full min-w-0 items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
                                            onClick={() =>
                                                toggleModule(moduleId)
                                            }
                                            aria-expanded={expanded}
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="block break-words font-semibold">
                                                    {module.title ||
                                                        `Module ${moduleIndex + 1}`}
                                                </span>

                                                <span className="mt-1 block text-xs text-base-content/60">
                                                    {moduleLessons.length}{" "}
                                                    lessons
                                                    {moduleCompleted
                                                        ? " · Completed"
                                                        : ""}
                                                </span>
                                            </span>

                                            <span
                                                className="shrink-0 text-base-content/60"
                                                aria-hidden="true"
                                            >
                                                {expanded ? "−" : "+"}
                                            </span>
                                        </button>

                                        {expanded && (
                                            <div className="space-y-1 px-2 pb-2 sm:px-3">
                                                {moduleLessons.map(
                                                    (
                                                        lesson,
                                                        lessonIndex
                                                    ) => {
                                                        const completed =
                                                            lesson._playerId &&
                                                            completedLessonIds.has(
                                                                lesson._playerId
                                                            );

                                                        const active =
                                                            lesson._playerId ===
                                                            selectedLessonId;

                                                        const lessonKey =
                                                            lesson._playerId ||
                                                            `${moduleId}-${lessonIndex}`;

                                                        const durationPanelId =
                                                            `lesson-duration-${moduleIndex}-${lessonIndex}`;

                                                        const durationOpen =
                                                            durationOpenLessonKey ===
                                                            lessonKey;

                                                        return (
                                                            <div
                                                                key={lessonKey}
                                                                className={`min-w-0 overflow-hidden rounded-lg transition-colors ${active
                                                                    ? "bg-primary/10"
                                                                    : "hover:bg-base-200"
                                                                    }`}
                                                            >
                                                                {/* Separate controls prevent nested buttons. */}
                                                                <div className="flex min-w-0 items-stretch gap-1">
                                                                    <button
                                                                        type="button"
                                                                        className={`flex min-h-12 min-w-0 flex-1 items-start gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary sm:px-3 ${active
                                                                            ? "text-primary"
                                                                            : ""
                                                                            }`}
                                                                        onClick={() =>
                                                                            selectLesson(
                                                                                lesson._playerId
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !lesson._playerId
                                                                        }
                                                                        aria-current={
                                                                            active
                                                                                ? "true"
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        <span
                                                                            className="mt-0.5 shrink-0"
                                                                            aria-hidden="true"
                                                                        >
                                                                            {completed
                                                                                ? "✓"
                                                                                : active
                                                                                    ? "▶"
                                                                                    : "○"}
                                                                        </span>

                                                                        <span className="min-w-0 flex-1 wrap-break-word leading-5">
                                                                            {lesson.title ||
                                                                                `Lesson ${lessonIndex + 1}`}
                                                                        </span>

                                                                        <span className="flex max-w-16 shrink-0 flex-wrap items-center justify-end gap-1 self-start sm:max-w-none">
                                                                            {lesson.liveClassLink && (
                                                                                <span
                                                                                    title="Live class"
                                                                                    aria-label="Live class available"
                                                                                >
                                                                                    🔴
                                                                                </span>
                                                                            )}

                                                                            {lesson.assignmentPrompt && (
                                                                                <span
                                                                                    title="Assignment"
                                                                                    aria-label="Assignment available"
                                                                                >
                                                                                    📝
                                                                                </span>
                                                                            )}

                                                                            {lesson.quiz?.length >
                                                                                0 && (
                                                                                    <span
                                                                                        title="Quiz"
                                                                                        aria-label="Quiz available"
                                                                                    >
                                                                                        ❓
                                                                                    </span>
                                                                                )}
                                                                        </span>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className={`my-1 mr-1 inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center self-start rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:mr-2 ${durationOpen
                                                                            ? "bg-primary/15 text-primary"
                                                                            : "text-base-content/60 hover:bg-base-300 hover:text-base-content"
                                                                            }`}
                                                                        onClick={() =>
                                                                            toggleLessonDuration(
                                                                                lessonKey
                                                                            )
                                                                        }
                                                                        aria-label={`${durationOpen
                                                                            ? "Hide"
                                                                            : "Show"
                                                                            } duration for ${lesson.title ||
                                                                            `Lesson ${lessonIndex + 1}`
                                                                            }`}
                                                                        aria-expanded={
                                                                            durationOpen
                                                                        }
                                                                        aria-controls={
                                                                            durationPanelId
                                                                        }
                                                                        title="Lesson duration"
                                                                    >
                                                                        <Clock
                                                                            size={18}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>
                                                                </div>

                                                                {durationOpen && (
                                                                    <div
                                                                        id={durationPanelId}
                                                                        role="region"
                                                                        aria-label={`Duration details for ${lesson.title ||
                                                                            `Lesson ${lessonIndex + 1}`
                                                                            }`}
                                                                        className="mx-2 mb-2 min-w-0 rounded-lg border border-base-300 bg-base-200/70 p-3 sm:mx-3 sm:p-4"
                                                                    >
                                                                        <div className="flex min-w-0 items-start gap-3">
                                                                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                                <Clock
                                                                                    size={18}
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </span>

                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="text-xs font-medium text-base-content/60 sm:text-sm">
                                                                                    Lesson duration
                                                                                </p>

                                                                                <p className="mt-1 wrap-break-word text-sm font-semibold text-base-content sm:text-base">
                                                                                    {formatLessonDuration(
                                                                                        lesson.duration
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-ghost btn-xs btn-square shrink-0"
                                                                                onClick={() =>
                                                                                    setDurationOpenLessonKey(
                                                                                        ""
                                                                                    )
                                                                                }
                                                                                aria-label="Close duration details"
                                                                            >
                                                                                <X
                                                                                    size={16}
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </aside>
            </div>
        </main>
    );
}

function AssignmentSubmission({
    courseId,
    lessonId,
    prompt,
    onComplete,
}) {
    const [answer, setAnswer] = useState("");
    const [previousSubmission, setPreviousSubmission] =
        useState(null);
    const [loadingPrevious, setLoadingPrevious] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const loadSubmission = useCallback(async () => {
        setLoadingPrevious(true);

        try {
            const assignmentApi = await import(
                "../../services/assignment.api"
            );

            const result = await assignmentApi.getMyAssignments(
                courseId
            );

            const submissions = getResponseData(result);
            const list = Array.isArray(submissions)
                ? submissions
                : [];

            setPreviousSubmission(
                list.find(
                    (item) =>
                        String(
                            item.lessonId?._id ?? item.lessonId
                        ) === String(lessonId)
                ) || null
            );
        } catch (err) {
            console.error(
                "Failed to load assignment submission:",
                err
            );
        } finally {
            setLoadingPrevious(false);
        }
    }, [courseId, lessonId]);

    useEffect(() => {
        loadSubmission();
    }, [loadSubmission]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedAnswer = answer.trim();

        if (!trimmedAnswer) return;

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const answerType = /^https?:\/\//i.test(
                trimmedAnswer
            )
                ? "link"
                : "text";

            await submitAssignment({
                courseId,
                lessonId,
                answer: trimmedAnswer,
                answerType,
            });

            setSuccess(true);
            setAnswer("");

            await loadSubmission();

            try {
                await onComplete();
            } catch (completionError) {
                console.error(
                    "Assignment submitted, but lesson completion failed:",
                    completionError
                );
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Failed to submit assignment. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingPrevious) {
        return (
            <div
                className="mt-6 flex justify-center"
                role="status"
                aria-label="Loading assignment"
            >
                <span className="loading loading-spinner" />
            </div>
        );
    }

    return (
        <section className="mt-7 min-w-0 border-t border-base-300 pt-5">
            <h2 className="text-lg font-bold">Assignment</h2>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                {prompt}
            </p>

            {error && (
                <div
                    role="alert"
                    className="alert alert-error mt-4 break-words"
                >
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="alert alert-success mt-4"
                >
                    <span>Assignment submitted successfully.</span>
                </div>
            )}

            {previousSubmission ? (
                <div className="mt-4 min-w-0 rounded-xl bg-base-200 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">
                            My Submission
                        </h3>

                        <span className="badge badge-ghost">
                            {previousSubmission.status || "Submitted"}
                        </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                        {previousSubmission.answer}
                    </p>

                    {previousSubmission.grade != null && (
                        <p className="mt-3 font-semibold">
                            Grade: {previousSubmission.grade}%
                        </p>
                    )}

                    {previousSubmission.reviewNotes && (
                        <div className="mt-3 rounded-lg border border-info/20 bg-info/10 p-3">
                            <p className="text-sm font-semibold">
                                Feedback
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                                {previousSubmission.reviewNotes}
                            </p>
                        </div>
                    )}

                    <p className="mt-3 break-words text-xs text-base-content/60">
                        Submitted:{" "}
                        {previousSubmission.createdAt
                            ? new Date(
                                previousSubmission.createdAt
                            ).toLocaleString()
                            : "Date unavailable"}
                    </p>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3"
                >
                    <label
                        htmlFor={`assignment-answer-${lessonId}`}
                        className="label"
                    >
                        <span className="label-text">
                            Your answer or submission link
                        </span>
                    </label>

                    <textarea
                        id={`assignment-answer-${lessonId}`}
                        value={answer}
                        onChange={(event) =>
                            setAnswer(event.target.value)
                        }
                        placeholder="Enter your answer or paste a shareable link"
                        className="textarea textarea-bordered min-h-32 w-full resize-y"
                        rows={4}
                        required
                        disabled={loading}
                    />

                    <button
                        className="btn btn-primary w-full sm:w-auto"
                        type="submit"
                        disabled={loading || !answer.trim()}
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit Assignment"}
                    </button>
                </form>
            )}
        </section>
    );
}

function QuizInterface({
    quiz,
    courseId,
    lessonId,
    onComplete,
}) {
    const [answers, setAnswers] = useState({});
    const [previousSubmission, setPreviousSubmission] =
        useState(null);
    const [loadingPrevious, setLoadingPrevious] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const loadSubmissions = useCallback(async () => {
        setLoadingPrevious(true);

        try {
            const response = await getMyQuizSubmissions(courseId);
            const data = getResponseData(response);

            const submissions = Array.isArray(data)
                ? data
                : [];

            const matching = submissions
                .filter(
                    (item) =>
                        String(
                            item.lessonId?._id ?? item.lessonId
                        ) === String(lessonId)
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || b.submittedAt || 0
                        ) -
                        new Date(
                            a.createdAt || a.submittedAt || 0
                        )
                );

            setPreviousSubmission(matching[0] || null);
        } catch (err) {
            console.error(
                "Failed to load quiz submissions:",
                err
            );
        } finally {
            setLoadingPrevious(false);
        }
    }, [courseId, lessonId]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    const handleSubmit = async () => {
        if (
            quiz.some(
                (_, index) => answers[index] === undefined
            )
        ) {
            setError(
                "Please answer all questions before submitting."
            );
            return;
        }

        setLoading(true);
        setError("");

        try {
            const answersArray = quiz.map(
                (_, index) => answers[index]
            );

            const response = await submitQuiz({
                courseId,
                lessonId,
                answers: answersArray,
            });

            const submission = getResponseData(response);

            setResult(submission);
            setPreviousSubmission(submission);

            try {
                await onComplete();
            } catch (completionError) {
                console.error(
                    "Quiz submitted, but lesson completion failed:",
                    completionError
                );
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Failed to submit quiz. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingPrevious) {
        return (
            <div
                className="mt-6 flex justify-center"
                role="status"
                aria-label="Loading quiz results"
            >
                <span className="loading loading-spinner" />
            </div>
        );
    }

    const displayedResult = result || previousSubmission;
    const score =
        displayedResult?.percent ??
        displayedResult?.score ??
        0;

    return (
        <section className="mt-7 min-w-0 border-t border-base-300 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">Quiz</h2>

                {previousSubmission && (
                    <span className="badge badge-success">
                        Previously Submitted
                    </span>
                )}
            </div>

            {displayedResult && (
                <div className="alert alert-info mt-4 min-w-0">
                    <div className="min-w-0">
                        <p className="font-semibold">
                            Latest quiz result
                        </p>

                        <p className="break-words">
                            Score: {score}%
                            {displayedResult.total != null &&
                                ` (${displayedResult.score}/${displayedResult.total})`}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-4 space-y-4">
                {quiz.map((question, questionIndex) => (
                    <fieldset
                        key={question._id || questionIndex}
                        className="min-w-0 rounded-xl border border-base-300 p-3 sm:p-4"
                    >
                        <legend className="max-w-full whitespace-normal break-words px-1 font-semibold">
                            {questionIndex + 1}.{" "}
                            {question.question}
                        </legend>

                        <div className="mt-3 space-y-2">
                            {(question.options || []).map(
                                (option, optionIndex) => (
                                    <label
                                        key={optionIndex}
                                        className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-base-200 sm:p-3"
                                    >
                                        <input
                                            type="radio"
                                            className="radio radio-primary radio-sm mt-0.5 shrink-0"
                                            name={`${lessonId}-question-${questionIndex}`}
                                            checked={
                                                answers[questionIndex] ===
                                                optionIndex
                                            }
                                            onChange={() =>
                                                setAnswers((previous) => ({
                                                    ...previous,
                                                    [questionIndex]:
                                                        optionIndex,
                                                }))
                                            }
                                            disabled={loading}
                                        />

                                        <span className="min-w-0 break-words text-sm leading-6">
                                            {option}
                                        </span>
                                    </label>
                                )
                            )}
                        </div>
                    </fieldset>
                ))}
            </div>

            {error && (
                <div
                    role="alert"
                    className="alert alert-error mt-4 break-words"
                >
                    <span>{error}</span>
                </div>
            )}

            <button
                type="button"
                className="btn btn-primary mt-4 w-full sm:w-auto"
                onClick={handleSubmit}
                disabled={
                    loading ||
                    quiz.length === 0 ||
                    quiz.some(
                        (_, index) => answers[index] === undefined
                    )
                }
            >
                {loading
                    ? "Submitting..."
                    : previousSubmission
                        ? "Submit New Attempt"
                        : "Submit Quiz"}
            </button>
        </section>
    );
}