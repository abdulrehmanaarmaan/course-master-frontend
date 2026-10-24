import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen, Users, Award, Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#78A083]/20 via-[#50727B]/15 to-[#344955]/25 border border-base-300 p-4 sm:p-8 lg:p-12 mb-6 sm:mb-10 shadow-xl">
            {/* Background glowing blurred radial orbs */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none -mr-10 -mt-10 sm:-mr-20 sm:-mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none -ml-10 -mb-10 sm:-ml-20 sm:-mb-20"></div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
                {/* Tagline Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-base-100/80 backdrop-blur border border-primary/30 text-primary text-[11px] sm:text-sm font-bold shadow-sm max-w-full truncate">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-pulse shrink-0" />
                    <span className="truncate">Next-Gen Digital E-Learning Platform</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-base-content">
                    Master In-Demand Skills with{" "}
                    <span className="gradient-text inline-block">CourseMaster</span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-lg lg:text-xl text-base-content/80 max-w-2xl mx-auto font-medium leading-relaxed px-2">
                    Access expert-led video masterclasses, interactive quizzes, live sessions, and hands-on assignments to supercharge your tech career.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 w-full max-w-md sm:max-w-none mx-auto">
                    <Link
                        to="/courses"
                        className="btn btn-primary btn-md sm:btn-lg px-6 sm:px-8 shadow-xl hover:shadow-2xl font-extrabold gap-2 group w-full sm:w-auto"
                    >
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Explore Courses</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {!isAuthenticated && (
                        <Link
                            to="/register"
                            className="btn btn-outline btn-md sm:btn-lg px-6 sm:px-8 border-2 font-bold w-full sm:w-auto hover:bg-base-200"
                        >
                            Get Started Free
                        </Link>
                    )}
                </div>

                {/* Key Highlights / Features */}
                <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-base-300/80 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-base-100/60 backdrop-blur border border-base-300/50">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-base-content truncate">Industry-Driven</p>
                            <p className="text-[11px] sm:text-xs text-base-content/60 truncate">Updated 2026 Syllabus</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-base-100/60 backdrop-blur border border-base-300/50">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-base-content truncate">Active Community</p>
                            <p className="text-[11px] sm:text-xs text-base-content/60 truncate">Live Mentorship & Q&A</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-base-100/60 backdrop-blur border border-base-300/50">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-accent/10 text-accent shrink-0">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-base-content truncate">Certified Learning</p>
                            <p className="text-[11px] sm:text-xs text-base-content/60 truncate">Quizzes & Assignments</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}