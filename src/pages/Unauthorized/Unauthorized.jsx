import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 sm:py-12 max-w-full overflow-x-hidden">
            <div className="card bg-base-100/90 backdrop-blur border border-base-300 shadow-xl rounded-3xl max-w-lg w-full overflow-hidden">
                {/* Top Visual Banner */}
                <div className="h-36 sm:h-44 bg-gradient-to-r from-error/20 via-warning/15 to-primary/20 p-6 relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-error/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex justify-between items-center relative z-10">
                        <span className="badge badge-error badge-outline font-bold px-3 py-1 text-xs gap-1">
                            <Lock className="w-3 h-3" /> Access Restricted
                        </span>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-error/20 text-error flex items-center justify-center shadow-sm shrink-0">
                            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-extrabold text-base-content/60 tracking-wider">Error 403</p>
                            <h1 className="text-xl sm:text-2xl font-black text-base-content leading-snug">
                                Unauthorized Access
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Card Content Body */}
                <div className="card-body p-6 sm:p-8 space-y-5">
                    <p className="text-sm sm:text-base text-base-content/80 leading-relaxed break-words">
                        Oops! You don&apos;t have the necessary permissions or role clearance to view this restricted page. If you believe this is an error, please contact your system administrator.
                    </p>

                    <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300 space-y-1">
                        <p className="text-xs font-semibold text-base-content/70">What you can do:</p>
                        <p className="text-xs sm:text-sm text-base-content/80">
                            • Check if you are logged into the correct account.<br />
                            • Return back to your designated dashboard or home page.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline btn-sm sm:btn-md w-full sm:flex-1 gap-2 font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                        <Link
                            to="/"
                            className="btn btn-primary btn-sm sm:btn-md w-full sm:flex-1 gap-2 font-bold shadow-md hover:shadow-lg"
                        >
                            <Home className="w-4 h-4" /> Home Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}