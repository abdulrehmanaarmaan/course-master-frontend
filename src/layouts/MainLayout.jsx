import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { getMeAsync } from "../store/slices/authSlice";
import { fetchMyEnrollments } from "../store/slices/enrollmentSlice";

export default function MainLayout() {

    const dispatch = useDispatch();

    const location = useLocation();

    const { token, isAuthenticated } = useSelector(
        (state) => state.auth

    );

    const isAdminRoute = location.pathname.startsWith("/admin");
    const isStudentRoute = location.pathname.startsWith("/student")

    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(getMeAsync());

        }
    }, [token, isAuthenticated, dispatch]);



    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchMyEnrollments());
        }

    }, [isAuthenticated, dispatch]);

    return (
        <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
            <Navbar />

            {isAdminRoute ? (
                <div className="flex flex-1 w-full min-w-0 overflow-x-hidden">
                    <Outlet />
                </div>
            ) : (
                <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-x-hidden">
                    <Outlet />
                </main>
            )}

            {(!isAdminRoute && !isStudentRoute) && <Footer />}
        </div>
    );

}