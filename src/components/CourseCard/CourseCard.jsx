import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Star } from "lucide-react";

export default function CourseCard({ course }) {
    const totalLessons = course.syllabus?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

    return (
        <div className="card bg-base-100/90 backdrop-blur border border-base-300 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group rounded-3xl overflow-hidden flex flex-col h-full hover:-translate-y-1 w-full min-w-0">
            {/* Visual Top Header Banner */}
            <div className="h-32 bg-gradient-to-r from-[#78A083]/30 via-[#50727B]/30 to-[#344955]/40 p-4 relative flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex justify-between items-start gap-2 relative z-10 min-w-0">
                    {course.category ? (
                        <span className="badge bg-base-100/90 backdrop-blur text-primary border-primary/30 font-bold px-3 py-1 shadow-sm text-xs truncate max-w-[65%]">
                            {course.category}
                        </span>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-1 bg-base-100/90 backdrop-blur px-2.5 py-0.5 rounded-full text-xs font-extrabold text-amber-500 shadow-sm shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-base-content/80 relative z-10 truncate">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{course.syllabus?.length || 0} Modules</span>
                    {totalLessons > 0 && <span className="truncate">• {totalLessons} Lessons</span>}
                </div>
            </div>

            <div className="card-body p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3 sm:space-y-4 min-w-0">
                <div className="min-w-0">
                    <h2 className="card-title text-base sm:text-lg lg:text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 break-words">
                        {course.title}
                    </h2>

                    <div className="text-sm text-base-content/70 mt-2 flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                            {course.instructorName ? course.instructorName[0].toUpperCase() : "I"}
                        </div>
                        <span className="font-semibold text-xs text-base-content/80 truncate">
                            By {course.instructorName}
                        </span>
                    </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                        {course.tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="badge badge-sm badge-ghost text-[11px] font-medium border-base-300 truncate max-w-full">
                                #{t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="pt-3 sm:pt-4 border-t border-base-300 flex items-center justify-between mt-auto gap-2">
                    <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs text-base-content/60 font-medium block">Course Fee</span>
                        <p className="font-black text-lg sm:text-xl gradient-text truncate">৳ {course.price?.toLocaleString()}</p>
                    </div>
                    <Link
                        to={`/courses/${course._id}`}
                        className="btn btn-primary btn-sm px-3 sm:px-4 shadow-md hover:shadow-lg font-bold gap-1 group-hover:bg-secondary shrink-0"
                    >
                        <span>Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}