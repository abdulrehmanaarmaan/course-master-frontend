import CoursesSection from "../../components/CourseCard/CoursesSection";

export default function Courses() {
    return (
        <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 py-4 sm:py-8">
            <h1 className="text-xl sm:text-3xl font-black mb-4 sm:mb-6 text-base-content">
                All Courses
            </h1>
            <CoursesSection />
        </div>
    );
}
