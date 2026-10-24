import { useState } from "react";
import { loginUser } from "../../services/auth.api";
import { saveToken } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck, UserCheck } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleQuickLogin = (email, password) => {
        setForm({ email, password });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handlePortalLogin(form?.email, form?.password);
    };

    const handlePortalLogin = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const res = await loginUser({ email, password });
            saveToken(res.data.token);

            localStorage.setItem("dev_bypass", "true");

            const role = res.data.user?.role;
            navigate(role === "admin" ? "/admin" : "/student", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto px-3 sm:px-6 py-6 sm:py-12">
            <div className="card bg-base-100/90 backdrop-blur border border-base-300 shadow-2xl relative overflow-hidden rounded-2xl sm:rounded-3xl">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

                <div className="card-body p-5 sm:p-8 md:p-10 relative z-10">
                    <div className="text-center mb-5 sm:mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Welcome Back
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            <span className="gradient-text">Sign In to CourseMaster</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-base-content/70 mt-2 max-w-sm mx-auto">
                            Enter your credentials to access your courses & dashboard
                        </p>
                    </div>

                    {/* Quick Demo Credentials Assistant */}
                    <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-base-200/80 border border-base-300 space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <p className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" /> Quick Demo Credentials:
                            </p>
                            <span className="badge badge-xs badge-outline text-[10px]">Testing Helper</span>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("admin@coursemaster.com", "admin123")}
                                className="btn btn-xs sm:btn-sm btn-outline btn-primary gap-1.5 font-semibold w-full justify-center min-h-[36px]"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Admin Fill</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("student@coursemaster.com", "student123")}
                                className="btn btn-xs sm:btn-sm btn-outline btn-secondary gap-1.5 font-semibold w-full justify-center min-h-[36px]"
                            >
                                <UserCheck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Student Fill</span>
                            </button>
                        </div>

                        {/* Dev Route Inspector Bypass */}
                        <div className="pt-2 border-t border-base-300/80">
                            <p className="text-[11px] font-semibold text-base-content/70 mb-2">
                                🔓 Direct Login & Inspect Routes (Dev Bypass):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePortalLogin("student@coursemaster.com", "student123")}
                                    className="btn btn-xs sm:btn-sm btn-primary font-bold text-xs w-full min-h-[36px]"
                                >
                                    🎓 Student Portal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePortalLogin("admin@coursemaster.com", "admin123")}
                                    className="btn btn-xs sm:btn-sm btn-secondary font-bold text-xs w-full min-h-[36px]"
                                >
                                    👑 Admin Portal
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error shadow-md text-xs sm:text-sm p-3 mb-4 rounded-xl flex items-center gap-2">
                            <span className="break-words w-full">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label py-1.5">
                                <span className="label-text text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-primary shrink-0" /> Email Address
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="admin@coursemaster.com"
                                    className="input input-bordered w-full focus:input-primary px-4 text-sm min-h-[44px]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label py-1.5">
                                <span className="label-text text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                                    <Lock className="w-4 h-4 text-primary shrink-0" /> Password
                                </span>
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full focus:input-primary pl-4 pr-11 text-sm min-h-[44px]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                    className="absolute right-3.5 p-1 text-base-content/50 hover:text-base-content focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-full btn-md sm:btn-lg shadow-lg hover:shadow-xl mt-6 gap-2 font-bold min-h-[48px]"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-md"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 shrink-0" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-4 border-t border-base-300">
                        <p className="text-xs sm:text-sm text-base-content/70">
                            Don't have an account?{" "}
                            <Link className="link link-primary font-bold ml-1 inline-block" to="/register">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}