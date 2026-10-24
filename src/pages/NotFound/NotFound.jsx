import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] w-full flex items-center justify-center px-4 py-12">
            <div className="text-center space-y-5 max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10 text-error font-black text-3xl mb-2">
                    404
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Page Not Found
                </h1>
                <p className="text-sm text-base-content/70 leading-relaxed">
                    The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link to="/" className="btn btn-primary w-full sm:w-auto gap-2 min-h-[44px]">
                        <Home className="w-4 h-4" /> Go to Home
                    </Link>
                    <button onClick={() => window.history.back()} className="btn btn-outline w-full sm:w-auto gap-2 min-h-[44px]">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}