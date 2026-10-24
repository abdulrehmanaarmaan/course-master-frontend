import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BookOpen,
    Users,
    Award,
    Sparkles,
    ShieldCheck,
    GraduationCap,
    Video,
    CheckCircle2,
    BarChart3,
    ArrowRight
} from "lucide-react";

export default function About() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    return (
        <div className="space-y-10 sm:space-y-16 max-w-full overflow-x-hidden py-4 sm:py-8">

            {/* ================= HERO BANNER ================= */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#78A083]/20 via-[#50727B]/15 to-[#344955]/25 border border-base-300 p-6 sm:p-10 lg:p-16 shadow-xl text-center">
                {/* Glow Orbs */}
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none -mr-10 -mt-10 sm:-mr-20 sm:-mt-20" />
                <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none -ml-10 -mb-10 sm:-ml-20 sm:-mb-20" />

                <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-100/80 backdrop-blur border border-primary/30 text-primary text-xs sm:text-sm font-bold shadow-sm">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
                        <span>Empowering Future Innovators</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-base-content leading-tight">
                        Transforming Education with <span className="gradient-text inline-block">CourseMaster</span>
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-base-content/80 font-medium leading-relaxed max-w-2xl mx-auto">
                        A complete end-to-end digital learning ecosystem designed to bridge the gap between ambitious learners and industry-ready skills.
                    </p>
                </div>
            </section>

            {/* ================= PLATFORM STATS ================= */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="p-4 sm:p-6 rounded-2xl bg-base-100/80 backdrop-blur border border-base-300 shadow-sm text-center space-y-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-black text-base-content">50+</p>
                    <p className="text-xs sm:text-sm text-base-content/70 font-semibold">Masterclass Courses</p>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-base-100/80 backdrop-blur border border-base-300 shadow-sm text-center space-y-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-black text-base-content">10k+</p>
                    <p className="text-xs sm:text-sm text-base-content/70 font-semibold">Active Learners</p>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-base-100/80 backdrop-blur border border-base-300 shadow-sm text-center space-y-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-black text-base-content">98%</p>
                    <p className="text-xs sm:text-sm text-base-content/70 font-semibold">Completion Rate</p>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-base-100/80 backdrop-blur border border-base-300 shadow-sm text-center space-y-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-success/10 text-success flex items-center justify-center mb-2">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-black text-base-content">24/7</p>
                    <p className="text-xs sm:text-sm text-base-content/70 font-semibold">Expert Support</p>
                </div>
            </section>

            {/* ================= CORE DUAL ECOSYSTEM ================= */}
            <section className="space-y-6 sm:space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
                        Built for Students & Administrators
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-base-content/70">
                        Engineered with a streamlined split workflow to provide the best experience for every user role.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* Student Experience */}
                    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-base-100 border border-base-300 shadow-lg space-y-5 relative overflow-hidden group hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-base-content">For Students</h3>
                                <p className="text-xs sm:text-sm text-base-content/60">An intuitive learning hub</p>
                            </div>
                        </div>

                        <ul className="space-y-3 text-xs sm:text-sm text-base-content/80 font-medium">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Browse, purchase, and instantly enroll in structured tech masterclasses.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Watch high-definition video lectures with seamless progress tracking.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Complete practical assignments and evaluate knowledge via interactive quizzes.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Admin Experience */}
                    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-base-100 border border-base-300 shadow-lg space-y-5 relative overflow-hidden group hover:border-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-secondary/10 text-secondary shrink-0">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-base-content">For Administrators</h3>
                                <p className="text-xs sm:text-sm text-base-content/60">Complete management portal</p>
                            </div>
                        </div>

                        <ul className="space-y-3 text-xs sm:text-sm text-base-content/80 font-medium">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                <span>Create, edit, and organize curriculum content and video modules.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                <span>Review student submissions, manage enrollments, and issue grades.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                <span>Access comprehensive analytics on platform performance and engagement.</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* ================= CALL TO ACTION ================= */}
            <section className="p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl bg-base-200/80 border border-base-300 text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
                    Ready to Start Your Learning Journey?
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-base-content/70 max-w-xl mx-auto font-medium">
                    Join thousands of students mastering top-tier industry skills today on CourseMaster.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
                    <Link
                        to="/courses"
                        className="btn btn-primary btn-md sm:btn-lg px-8 shadow-xl font-extrabold gap-2 w-full sm:w-auto min-h-[44px]"
                    >
                        <BookOpen className="w-5 h-5 shrink-0" />
                        <span>Explore Courses</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>

                    {!isAuthenticated && (
                        <Link
                            to="/register"
                            className="btn btn-outline btn-md sm:btn-lg px-8 border-2 font-bold w-full sm:w-auto min-h-[44px]"
                        >
                            Create Account
                        </Link>
                    )}

                    {isAuthenticated && user?.role === "admin" && (
                        <Link
                            to="/admin"
                            className="btn btn-secondary btn-md sm:btn-lg px-8 font-bold w-full sm:w-auto min-h-[44px]"
                        >
                            Admin Dashboard
                        </Link>
                    )}
                </div>
            </section>

        </div>
    );
}