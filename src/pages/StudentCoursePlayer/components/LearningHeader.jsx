
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    LayoutDashboard,
} from "lucide-react";

export default function LearningHeader({
    courseTitle = "Course Player",
    progress = 0,
    courseId,
}) {
    const safeProgress = Math.min(
        100,
        Math.max(0, Number(progress) || 0)
    );

    const backToCourse = courseId
        ? `/courses/${courseId}`
        : "/courses";

    return (
        <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100">
            <div className="mx-auto grid min-h-16 w-full max-w-screen-2xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 py-2 sm:gap-4 sm:px-4 md:px-6 lg:px-8">
                {/* Back to course */}
                <Link
                    to={backToCourse}
                    className="btn btn-ghost btn-sm min-h-9 gap-1 px-2 sm:gap-2 sm:px-3"
                    aria-label="Back to course details"
                    title="Back to course"
                >
                    <ArrowLeft
                        size={18}
                        className="shrink-0"
                        aria-hidden="true"
                    />

                    <span className="hidden sm:inline">
                        Back to course
                    </span>
                </Link>

                {/* Course title and progress */}
                <div className="mx-auto min-w-0 w-full max-w-2xl">
                    <div className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2">
                        <BookOpen
                            size={18}
                            className="shrink-0 text-primary"
                            aria-hidden="true"
                        />

                        <h1
                            className="min-w-0 truncate text-center text-xs font-semibold sm:text-sm md:text-base"
                            title={courseTitle}
                        >
                            {courseTitle}
                        </h1>
                    </div>

                    <div className="mx-auto mt-1 flex w-full max-w-xs items-center gap-1.5 sm:gap-2">
                        <progress
                            className="progress progress-primary h-1.5 min-w-0 flex-1"
                            value={safeProgress}
                            max={100}
                            aria-label="Course progress"
                        />

                        <span
                            className="shrink-0 text-[10px] tabular-nums text-base-content/60 sm:text-xs"
                            aria-label={`${safeProgress}% completed`}
                        >
                            {safeProgress}%
                        </span>
                    </div>
                </div>

                {/* Student dashboard */}
                <Link
                    to="/student"
                    className="btn btn-ghost btn-sm min-h-9 gap-1 px-2 sm:gap-2 sm:px-3"
                    aria-label="Go to student dashboard"
                    title="Student dashboard"
                >
                    <LayoutDashboard
                        size={18}
                        className="shrink-0"
                        aria-hidden="true"
                    />

                    <span className="hidden md:inline">
                        Dashboard
                    </span>
                </Link>
            </div>
        </header>
    );
}
