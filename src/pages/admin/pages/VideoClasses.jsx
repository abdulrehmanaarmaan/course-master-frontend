import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../../store/slices/coursesSlice";
import { updateCourseAsync } from "../../../store/slices/adminSlice";
import { Link } from "react-router-dom";
import { Video, Calendar, ExternalLink, Clock, Play, X, Monitor } from "lucide-react";

export default function VideoClasses() {
    const dispatch = useDispatch();
    const { courses, loading } = useSelector((state) => state.courses);
    const { updating } = useSelector((state) => state.admin);
    const [filter, setFilter] = useState("all"); // all, upcoming, past
    const [showStartClassModal, setShowStartClassModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        dispatch(fetchCourses({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Extract all live classes from all courses
    const getAllLiveClasses = () => {
        const liveClasses = [];
        courses.forEach((course) => {
            if (course.syllabus && course.syllabus.length > 0) {
                course.syllabus.forEach((module) => {
                    if (module.lessons && module.lessons.length > 0) {
                        module.lessons.forEach((lesson) => {
                            if (lesson.liveClassLink) {
                                const liveClassDate = lesson.liveClassDate
                                    ? new Date(lesson.liveClassDate)
                                    : null;
                                const isUpcoming = liveClassDate && liveClassDate > new Date();
                                const isPast = liveClassDate && liveClassDate < new Date();

                                liveClasses.push({
                                    id: lesson._id,
                                    courseId: course._id,
                                    courseTitle: course.title,
                                    moduleTitle: module.title,
                                    lessonTitle: lesson.title,
                                    liveClassLink: lesson.liveClassLink,
                                    liveClassDate: liveClassDate,
                                    isUpcoming,
                                    isPast,
                                    hasDate: !!liveClassDate,
                                });
                            }
                        });
                    }
                });
            }
        });
        return liveClasses;
    };

    const allLiveClasses = getAllLiveClasses();

    // Filter live classes
    const filteredLiveClasses = allLiveClasses.filter((lc) => {
        if (filter === "upcoming") return lc.isUpcoming;
        if (filter === "past") return lc.isPast;
        return true;
    });

    // Sort by date (upcoming first, then past)
    const sortedLiveClasses = [...filteredLiveClasses].sort((a, b) => {
        if (!a.liveClassDate && !b.liveClassDate) return 0;
        if (!a.liveClassDate) return 1;
        if (!b.liveClassDate) return -1;
        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;
        return a.liveClassDate - b.liveClassDate;
    });

    const upcomingCount = allLiveClasses.filter((lc) => lc.isUpcoming).length;
    const pastCount = allLiveClasses.filter((lc) => lc.isPast).length;

    // Open Zoom to create meeting
    const openZoom = () => {
        window.open("https://zoom.us/meeting/schedule", "_blank");
    };

    // Handle Start Class - show modal
    const handleStartClass = (liveClass) => {
        if (!liveClass) {
            alert("Please select a class from the list below, or create a new course with a lesson first.");
            return;
        }
        setSelectedClass(liveClass);
        setShowStartClassModal(true);
    };

    // Handle Zoom option
    const handleZoom = async () => {
        openZoom();
        if (selectedClass) {
            alert("Zoom meeting page opened. After creating the meeting, copy the meeting link and paste it in the course edit page.");
            setShowStartClassModal(false);
            window.location.href = `/admin/courses/edit/${selectedClass.courseId}`;
        } else {
            alert("Zoom meeting page opened. After creating the meeting, copy the meeting link and add it to a course lesson in the course edit page.");
            setShowStartClassModal(false);
        }
    };

    // Handle Meet option - generate instant meeting
    const handleMeet = async () => {
        window.open("https://meet.google.com/new", "_blank");

        if (selectedClass) {
            const meetLink = prompt(
                "Google Meet opened in a new tab.\n\n" +
                "Please:\n" +
                "1. Copy the meeting link from the Google Meet tab\n" +
                "2. Paste it here\n\n" +
                "Or click Cancel to add it manually later.",
                ""
            );

            if (meetLink && meetLink.trim()) {
                try {
                    const course = courses.find(c => c._id === selectedClass.courseId);
                    if (!course) {
                        alert("Course not found");
                        return;
                    }

                    const updatedSyllabus = course.syllabus.map(module => {
                        const updatedLessons = module.lessons.map(lesson => {
                            if (lesson._id === selectedClass.id) {
                                return {
                                    ...lesson,
                                    liveClassLink: meetLink.trim(),
                                    liveClassDate: new Date().toISOString()
                                };
                            }
                            return lesson;
                        });
                        return { ...module, lessons: updatedLessons };
                    });

                    await dispatch(updateCourseAsync({
                        id: selectedClass.courseId,
                        data: { syllabus: updatedSyllabus }
                    })).unwrap();

                    alert("✅ Google Meet link saved successfully!");
                    dispatch(fetchCourses({ page: 1, limit: 100 }));
                } catch (err) {
                    alert("Failed to save Meet link. Please add it manually in the course edit page.");
                    console.error(err);
                }
            }
        } else {
            alert("Google Meet opened in a new tab. Copy the meeting link and add it to a course lesson in the course edit page.");
        }

        setShowStartClassModal(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-base-content">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                    Video Classes Management
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-3 sm:p-4">
                        <div className="text-xl sm:text-2xl font-bold text-primary">{allLiveClasses.length}</div>
                        <div className="text-xs sm:text-sm text-base-content/70">Total Live Classes</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-3 sm:p-4">
                        <div className="text-xl sm:text-2xl font-bold text-success">{upcomingCount}</div>
                        <div className="text-xs sm:text-sm text-base-content/70">Upcoming Classes</div>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-3 sm:p-4">
                        <div className="text-xl sm:text-2xl font-bold text-base-content/50">{pastCount}</div>
                        <div className="text-xs sm:text-sm text-base-content/70">Past Classes</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`btn btn-xs sm:btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
                        >
                            All ({allLiveClasses.length})
                        </button>
                        <button
                            onClick={() => setFilter("upcoming")}
                            className={`btn btn-xs sm:btn-sm ${filter === "upcoming" ? "btn-primary" : "btn-outline"}`}
                        >
                            Upcoming ({upcomingCount})
                        </button>
                        <button
                            onClick={() => setFilter("past")}
                            className={`btn btn-xs sm:btn-sm ${filter === "past" ? "btn-primary" : "btn-outline"}`}
                        >
                            Past ({pastCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Classes List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : sortedLiveClasses.length === 0 ? (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-6 text-center">
                        <Video className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-base-content/30" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                            {filter === "all"
                                ? "No live classes found"
                                : `No ${filter} live classes found`}
                        </h3>
                        <p className="text-xs sm:text-sm text-base-content/70 mb-4 max-w-md mx-auto">
                            {filter === "all"
                                ? "Start a new video class or add live class links when creating or editing courses."
                                : `No ${filter} classes available.`}
                        </p>
                        {filter === "all" && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        setSelectedClass(null);
                                        setShowStartClassModal(true);
                                    }}
                                    className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
                                >
                                    <Play className="w-4 h-4" />
                                    Start New Class
                                </button>
                                <Link
                                    to="/admin/courses"
                                    className="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto"
                                >
                                    Manage Courses
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedLiveClasses.map((lc) => (
                        <div
                            key={lc.id}
                            className={`card border-2 shadow-sm ${lc.isUpcoming
                                ? "bg-info/10 border-info"
                                : lc.isPast
                                    ? "bg-base-200 border-base-300"
                                    : "bg-base-100 border-base-300"
                                }`}
                        >
                            <div className="card-body p-4 sm:p-5">
                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2.5 sm:gap-3 mb-2">
                                            <Video className="w-5 h-5 text-info mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base sm:text-lg mb-1 break-words leading-snug">
                                                    {lc.lessonTitle}
                                                </h3>
                                                <div className="text-xs sm:text-sm text-base-content/70 space-y-1">
                                                    <div className="truncate">
                                                        <span className="font-semibold">Course:</span>{" "}
                                                        <Link
                                                            to={`/admin/courses/edit/${lc.courseId}`}
                                                            className="link link-primary font-medium"
                                                        >
                                                            {lc.courseTitle}
                                                        </Link>
                                                    </div>
                                                    <div className="truncate">
                                                        <span className="font-semibold">Module:</span> {lc.moduleTitle}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {lc.liveClassDate && (
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 text-xs sm:text-sm">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                                <span className="font-semibold">Scheduled:</span>
                                                <span className="break-words">{lc.liveClassDate.toLocaleString()}</span>
                                                {lc.isUpcoming && (
                                                    <span className="badge badge-success badge-sm text-[10px] sm:text-xs">Upcoming</span>
                                                )}
                                                {lc.isPast && (
                                                    <span className="badge badge-ghost badge-sm text-[10px] sm:text-xs">Past</span>
                                                )}
                                            </div>
                                        )}

                                        {!lc.hasDate && (
                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 text-xs sm:text-sm text-warning">
                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                                <span>No scheduled date</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons - Stacked full-width on mobile, inline on desktop */}
                                    <div className="flex flex-col sm:flex-row xl:flex-row gap-2 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-base-300">
                                        <button
                                            onClick={() => handleStartClass(lc)}
                                            className="btn btn-success btn-sm w-full sm:w-auto justify-center"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start Class
                                        </button>
                                        <a
                                            href={lc.liveClassLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-info btn-sm w-full sm:w-auto justify-center"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Join Class
                                        </a>
                                        <Link
                                            to={`/admin/courses/edit/${lc.courseId}`}
                                            className="btn btn-outline btn-sm w-full sm:w-auto justify-center"
                                        >
                                            Edit Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Start Class Modal */}
            {showStartClassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
                    <div className="card bg-base-100 shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col my-auto">
                        <div className="card-body p-4 sm:p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h2 className="card-title text-lg sm:text-xl flex items-center gap-2">
                                    <Play className="w-5 h-5 text-primary" />
                                    Start Video Class
                                </h2>
                                <button
                                    onClick={() => setShowStartClassModal(false)}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {selectedClass ? (
                                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                                    <p className="text-xs sm:text-sm font-semibold mb-1">Class Details:</p>
                                    <p className="text-xs sm:text-sm font-medium">{selectedClass.lessonTitle}</p>
                                    <p className="text-[11px] sm:text-xs text-base-content/70 truncate">
                                        {selectedClass.courseTitle} - {selectedClass.moduleTitle}
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                    <p className="text-xs sm:text-sm font-semibold mb-1 text-warning">⚠️ No Course Selected</p>
                                    <p className="text-[11px] sm:text-xs text-base-content/70">
                                        The meeting link will be generated. You can add it to a course lesson later in the course edit page.
                                    </p>
                                </div>
                            )}

                            <p className="text-xs sm:text-sm text-base-content/70 mb-4">
                                Choose your preferred video conferencing platform:
                            </p>

                            <div className="space-y-3">
                                {/* Google Meet Option */}
                                <button
                                    onClick={handleMeet}
                                    disabled={updating}
                                    className="btn btn-outline w-full justify-start gap-3 h-auto py-2.5 sm:py-3 hover:btn-info"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                        <div className="font-semibold text-xs sm:text-sm">Google Meet</div>
                                        <div className="text-[10px] sm:text-xs text-base-content/70 leading-tight">
                                            Instant meeting - Link auto-saved
                                        </div>
                                    </div>
                                </button>

                                {/* Zoom Option */}
                                <button
                                    onClick={handleZoom}
                                    className="btn btn-outline w-full justify-start gap-3 h-auto py-2.5 sm:py-3 hover:btn-primary"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        <Monitor className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                        <div className="font-semibold text-xs sm:text-sm">Zoom</div>
                                        <div className="text-[10px] sm:text-xs text-base-content/70 leading-tight">
                                            Create meeting - Copy link manually
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-4 pt-3 border-t border-base-300">
                                <p className="text-[11px] sm:text-xs text-base-content/60 leading-relaxed">
                                    💡 <strong>Tip:</strong> For Google Meet, the link will be automatically saved to your course.
                                    For Zoom, copy the meeting link and add it manually.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}