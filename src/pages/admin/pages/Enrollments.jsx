import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEnrollments } from "../../../store/slices/adminSlice";
import { fetchCourses } from "../../../store/slices/coursesSlice";
import TableSkeleton from "../../../components/Loaders/TableSkeleton";
import CardListSkeleton from "../../../components/Loaders/CardListSkeleton";

export default function Enrollments() {
    const dispatch = useDispatch();
    const { enrollments, loading } = useSelector((state) => state.admin);
    const { courses } = useSelector((state) => state.courses);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [searchStudent, setSearchStudent] = useState("");

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.allSettled([
            dispatch(fetchEnrollments()),
            dispatch(fetchCourses({ page: 1, limit: 100 })),
        ]).then(() => setLoaded(true));
    }, [dispatch]);

    // Filter enrollments by selected course and student name
    const filteredEnrollments = enrollments.filter((enr) => {
        const matchCourse = !selectedCourse || enr.course?._id === selectedCourse;
        const matchStudent = !searchStudent || enr.student?.name?.toLowerCase().includes(searchStudent.toLowerCase());
        return matchCourse && matchStudent;
    });

    return (
        <div className="w-full min-w-0 space-y-4 sm:space-y-6">
            <h1 className="page-heading">Enrollment Management</h1>

            {/* Filters */}
            <div className="card min-w-0 bg-base-100 shadow-sm">
                <div className="card-body min-w-0 p-3 sm:p-5 lg:p-6">
                    <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="form-control min-w-0">
                            <label className="label">
                                <span className="label-text font-semibold">Filter by Course</span>
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="select select-bordered w-full min-w-0"
                            >
                                <option value="">All Courses</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control min-w-0">
                            <label className="label">
                                <span className="label-text font-semibold">Search Student</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className="input input-bordered w-full min-w-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading || !loaded ? (
                <>
                    <div className="hidden md:block">
                        <TableSkeleton columns={5} rows={8} label="Loading enrollments" />
                    </div>
                    <div className="md:hidden">
                        <CardListSkeleton count={5} label="Loading enrollments" />
                    </div>
                </>
            ) : filteredEnrollments.length === 0 ? (
                <div className="alert min-w-0 break-words">
                    <span>No enrollments found</span>
                </div>
            ) : (
                <>
                    {/* Table view for md+ */}
                    <div className="hidden md:block min-w-0 max-w-full overflow-x-auto border border-base-300 rounded-lg">
                        <table className="table w-full min-w-[640px]">
                            <thead className="bg-base-200">
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Enrolled Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEnrollments.map((enr) => (
                                    <tr key={enr._id} className="hover:bg-base-100">
                                        <td className="font-semibold break-words">{enr.student?.name}</td>
                                        <td className="max-w-[16rem] break-all">{enr.student?.email}</td>
                                        <td className="max-w-[18rem] break-words">{enr.course?.title}</td>
                                        <td className="whitespace-nowrap">{new Date(enr.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className="badge badge-success whitespace-nowrap">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Card view for small screens */}
                    <div className="md:hidden min-w-0 space-y-3">
                        {filteredEnrollments.map((enr) => (
                            <div key={enr._id} className="card min-w-0 bg-base-100 shadow-sm border border-base-200">
                                <div className="card-body min-w-0 p-3 sm:p-4">
                                    <div className="flex min-w-0 flex-col gap-3 xs:flex-row xs:justify-between xs:items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-base sm:text-lg break-words">{enr.student?.name}</div>
                                            <div className="text-sm text-base-content/70 break-all">{enr.student?.email}</div>
                                            <div className="text-sm text-base-content/70 mt-2 break-words">{enr.course?.title}</div>
                                            <div className="text-xs text-base-content/60 mt-2">
                                                Enrolled: {new Date(enr.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <span className="badge badge-success whitespace-nowrap">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-sm text-base-content/60">
                        Total: {filteredEnrollments.length} enrollment(s)
                    </div>
                </>
            )}
        </div>
    );
}
