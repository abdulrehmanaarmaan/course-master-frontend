import { useState } from "react";
import { registerUser } from "../../services/auth.api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", adminKey: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAdminKey, setShowAdminKey] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
            };
            if (form.adminKey.trim()) {
                payload.adminKey = form.adminKey.trim();
            }

            await registerUser(payload);

            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Register failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-3 sm:px-6 py-6 sm:py-12">
            <div className="card bg-base-100 border border-base-300 shadow-2xl rounded-2xl sm:rounded-3xl">
                <div className="card-body p-5 sm:p-8">
                    <div className="text-center mb-5">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1.5 leading-tight">
                            <span className="gradient-text">Create Account</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-base-content/70">Start your learning journey today</p>
                    </div>

                    {error && (
                        <div className="alert alert-error shadow-lg text-xs sm:text-sm p-3 rounded-xl mb-2">
                            <span className="break-words w-full">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs sm:text-sm font-semibold">Full Name</span>
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="input input-bordered w-full focus:input-primary text-sm min-h-[44px]"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs sm:text-sm font-semibold">Email</span>
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="input input-bordered w-full focus:input-primary text-sm min-h-[44px]"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs sm:text-sm font-semibold">Password</span>
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="input input-bordered w-full focus:input-primary text-sm min-h-[44px]"
                                required
                            />
                        </div>

                        {/* Admin Registration Key (Optional) */}
                        <div className="form-control pt-1">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <label className="label py-0">
                                    <span className="label-text text-xs sm:text-sm font-semibold">Admin Key (Optional)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowAdminKey(!showAdminKey)}
                                    className="btn btn-xs btn-ghost text-xs"
                                >
                                    {showAdminKey ? "Hide" : "Show Key Field"}
                                </button>
                            </div>
                            {showAdminKey && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <input
                                        name="adminKey"
                                        type="password"
                                        value={form.adminKey}
                                        onChange={handleChange}
                                        placeholder="Enter admin registration key"
                                        className="input input-bordered w-full text-sm min-h-[40px]"
                                    />
                                    <span className="label-text-alt text-[11px] text-base-content/60 block px-1">
                                        Only required for creating elevated administrative accounts.
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-full btn-md sm:btn-lg shadow-lg hover:shadow-xl mt-4 font-bold min-h-12"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="text-xs sm:text-sm mt-6 text-center text-base-content/70">
                        Already have an account?{" "}
                        <Link className="link link-primary font-bold ml-1 inline-block" to="/login">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}