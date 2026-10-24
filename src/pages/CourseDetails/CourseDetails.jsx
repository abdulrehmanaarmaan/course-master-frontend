import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCourseById,
    clearCurrentCourse,
} from "../../store/slices/coursesSlice";
import { enrollCourseAsync, clearSuccess } from "../../store/slices/enrollmentSlice";
import { getMeAsync } from "../../store/slices/authSlice";

export default function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentCourse, detailLoading, error: courseError } = useSelector((state) => state.courses);
    const { enrolling, error: enrollError, success, enrollments: myEnrollments } = useSelector((state) => state.enrollment);
    const { user, token } = useSelector((state) => state.auth);
    const [selectedBatchId, setSelectedBatchId] = useState(null);

    useEffect(() => {
        dispatch(fetchCourseById(id));
        return () => dispatch(clearCurrentCourse());
    }, [id, dispatch]);

    // Load user if token exists but user is not loaded
    useEffect(() => {
        if (token && !user) {
            dispatch(getMeAsync());
        }
    }, [token, user, dispatch]);

    const isCreator = user && currentCourse && user._id === currentCourse.instructorId;
    const isAdmin = user && user.role === "admin";
    const cannotEnroll = isAdmin || isCreator;

    const alreadyEnrolled = !!myEnrollments?.find((e) => e.course?._id === id);

    const handleEnroll = async () => {
        // Require a valid login session.
        if (!token) {
            navigate("/login");
            return;
        }

        let currentUser = user;

        // Resolve the user before checking their enrollment permissions.
        if (!currentUser) {
            try {
                currentUser = await dispatch(getMeAsync()).unwrap();
            } catch {
                navigate("/login");
                return;
            }
        }

        // Administrators and course creators cannot enroll.
        const instructorId =
            currentCourse?.instructorId?._id ??
            currentCourse?.instructorId;

        if (
            currentUser?.role === "admin" ||
            String(currentUser?._id) === String(instructorId)
        ) {
            return;
        }

        // Avoid navigating or enrolling again if already enrolled.
        const hasEnrollment = myEnrollments?.some(
            (enrollment) =>
                String(enrollment.course?._id ?? enrollment.course) === String(id)
        );

        if (hasEnrollment) {
            navigate("/student");
            return;
        }

        // Send the selected batch, or null when no batch is selected.
        dispatch(
            enrollCourseAsync({
                courseId: id,
                batchId:
                    selectedBatchId !== null
                        ? String(selectedBatchId)
                        : null,
            })
        );
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate("/student");
                dispatch(clearSuccess());
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [success, navigate, dispatch]);

    if (detailLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (courseError || !currentCourse) {
        return (
            <div className="alert alert-error shadow-sm text-xs sm:text-sm">
                <span>{courseError || "Course not found"}</span>
            </div>
        );
    }

    const course = currentCourse;

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            {/* Header / Main Details Card */}
            <div className="card bg-base-100 border border-base-300 shadow-md">
                <div className="card-body p-4 sm:p-6 space-y-2">
                    <h1 className="text-xl sm:text-3xl font-black leading-tight text-base-content break-words">
                        {course.title}
                    </h1>

                    {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {course.tags.map((tag, i) => (
                                <span key={i} className="badge badge-primary badge-outline text-xs">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-xs sm:text-base text-base-content/70 pt-1">
                        Instructor: <span className="font-semibold text-base-content">{course.instructorName}</span>
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-3 border-t border-base-200 mt-2">
                        <p className="text-2xl sm:text-3xl font-black gradient-text">
                            ৳ {course.price?.toLocaleString()}
                        </p>

                        <div className="w-full sm:w-auto">
                            {isAdmin ? (
                                <Link
                                    to={`/admin/courses/edit/${id}`}
                                    className="btn btn-primary btn-sm sm:btn-md gap-2 w-full sm:w-auto"
                                >
                                    📚 Manage Course
                                </Link>
                            ) : cannotEnroll ? (
                                <div className="alert alert-info text-xs sm:text-sm p-3">
                                    <span>Course creators cannot enroll in their own courses.</span>
                                </div>
                            ) : success ? (
                                <div className="alert alert-success text-xs sm:text-sm p-3">
                                    <span>{success}</span>
                                </div>
                            ) : enrollError ? (
                                <div className="alert alert-error text-xs sm:text-sm p-3">
                                    <span>{enrollError}</span>
                                </div>
                            ) : alreadyEnrolled ? (
                                <button
                                    onClick={() => navigate('/student')}
                                    className="btn btn-outline btn-sm sm:btn-md gap-2 w-full sm:w-auto"
                                >
                                    Go to Dashboard
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="btn btn-primary btn-sm sm:btn-md gap-2 w-full sm:w-auto"
                                >
                                    {enrolling ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Enrolling...
                                        </>
                                    ) : (
                                        "Enroll Now"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description Card */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-bold mb-2 text-base-content">Course Description</h2>
                    <p className="text-xs sm:text-base text-base-content/80 leading-relaxed break-words whitespace-pre-line">
                        {course.description}
                    </p>
                </div>
            </div>

            {/* Available Batches Section */}
            {course.batches && course.batches.length > 0 && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold mb-3 text-base-content">Available Batches</h2>
                        <div className="space-y-2">
                            {course.batches.map((batch, idx) => {
                                const batchIndex = idx;
                                const isSelected = selectedBatchId === batchIndex;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedBatchId(isSelected ? null : batchIndex)}
                                        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-xl cursor-pointer transition-all gap-2 ${isSelected
                                            ? "bg-primary text-primary-content border-2 border-primary shadow-sm"
                                            : "bg-base-200 hover:bg-base-300 border-2 border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => setSelectedBatchId(isSelected ? null : batchIndex)}
                                                className="radio radio-xs sm:radio-sm shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="font-semibold text-xs sm:text-sm truncate">
                                                {batch.name}
                                            </span>
                                        </div>
                                        <span className="text-[11px] sm:text-xs opacity-80 shrink-0 ml-7 sm:ml-0">
                                            {batch.startDate
                                                ? `Start: ${new Date(batch.startDate).toLocaleDateString()}`
                                                : "No start date"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedBatchId !== null && (
                            <div className="mt-3 text-xs sm:text-sm text-primary font-semibold">
                                ✓ Batch selected for enrollment
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Course Syllabus Section (Enrolled or Admin) */}
            {(alreadyEnrolled || isAdmin) && course.syllabus && course.syllabus.length > 0 && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                            <h2 className="text-base sm:text-lg font-bold text-base-content">Course Syllabus</h2>
                            {isAdmin && (
                                <Link
                                    to={`/admin/courses/edit/${id}`}
                                    className="btn btn-xs sm:btn-sm btn-primary gap-1.5 w-fit"
                                >
                                    ✏️ Edit Syllabus
                                </Link>
                            )}
                        </div>

                        <div className="space-y-3 mt-2">
                            {course.syllabus.map((module, modIdx) => (
                                <div key={module._id || modIdx} className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-xl">
                                    <input type="checkbox" defaultChecked={modIdx === 0} />
                                    <div className="collapse-title font-semibold text-xs sm:text-sm bg-base-200/60 hover:bg-base-200">
                                        📚 Module {modIdx + 1}: {module.title}
                                    </div>
                                    <div className="collapse-content px-3 sm:px-4">
                                        <ul className="space-y-2 pt-3">
                                            {module.lessons?.map((lesson, lesIdx) => (
                                                <li key={lesson._id || lesIdx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-base-200/50 min-w-0">
                                                    <span className="badge badge-sm badge-outline shrink-0 mt-0.5">{lesIdx + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-xs sm:text-sm text-base-content break-words">{lesson.title}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            {lesson.videoUrl && (
                                                                <a
                                                                    href={lesson.videoUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary text-xs hover:underline inline-flex items-center gap-1 font-semibold break-all"
                                                                >
                                                                    🎬 Watch Video
                                                                </a>
                                                            )}
                                                            {lesson.liveClassLink && (
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <a
                                                                        href={lesson.liveClassLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="badge badge-info badge-sm text-[10px] font-semibold"
                                                                    >
                                                                        🔴 Live Class
                                                                    </a>
                                                                    {lesson.liveClassDate && (
                                                                        <span className="text-[10px] text-base-content/70">
                                                                            {new Date(lesson.liveClassDate).toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Non-enrolled Syllabus Locked Notice */}
            {!alreadyEnrolled && !isAdmin && course.syllabus && course.syllabus.length > 0 && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-base-content">Course Syllabus</h2>
                        <div className="alert alert-info shadow-sm text-xs sm:text-sm mt-3">
                            <span>📚 Enroll in this course to view the complete syllabus and access all lessons.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty Syllabus Notice for Admin */}
            {isAdmin && (!course.syllabus || course.syllabus.length === 0) && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-base-content">Course Syllabus</h2>
                        <div className="alert alert-warning shadow-sm text-xs sm:text-sm mt-3">
                            <span>📚 No syllabus added yet. Click below to add syllabus modules and lessons.</span>
                        </div>
                        <Link
                            to={`/admin/courses/edit/${id}`}
                            className="btn btn-primary btn-sm mt-3 gap-2 w-fit"
                        >
                            ➕ Add Syllabus
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}