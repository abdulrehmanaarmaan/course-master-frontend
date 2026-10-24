import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Logo() {
    return (
        <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-[#78A083] to-[#50727B] text-white shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl lg:text-2xl tracking-tight gradient-text">
                Course<span className="text-primary font-black">Master</span>
            </span>
        </Link>
    );
}