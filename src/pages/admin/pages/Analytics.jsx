import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { getAnalytics } from "../../../services/admin.api";

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getAnalytics();
                setData(res.data);
            } catch (err) {
                console.error("Failed to load analytics:", err);
                setError(err.response?.data?.message || "Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error shadow-sm text-xs sm:text-sm">
                <span>{error}</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="alert shadow-sm text-xs sm:text-sm">
                <span>No analytics data available</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                Analytics Dashboard
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="card bg-primary text-primary-content shadow-sm">
                    <div className="card-body p-4 sm:p-5">
                        <h3 className="text-xs sm:text-sm font-semibold opacity-80">Total Enrollments</h3>
                        <p className="text-2xl sm:text-3xl font-bold">{data.stats?.totalEnrollments || 0}</p>
                    </div>
                </div>

                <div className="card bg-secondary text-secondary-content shadow-sm">
                    <div className="card-body p-4 sm:p-5">
                        <h3 className="text-xs sm:text-sm font-semibold opacity-80">Total Courses</h3>
                        <p className="text-2xl sm:text-3xl font-bold">{data.stats?.totalCourses || 0}</p>
                    </div>
                </div>

                <div className="card bg-accent text-accent-content shadow-sm">
                    <div className="card-body p-4 sm:p-5">
                        <h3 className="text-xs sm:text-sm font-semibold opacity-80">Total Students</h3>
                        <p className="text-2xl sm:text-3xl font-bold">{data.stats?.totalStudents || 0}</p>
                    </div>
                </div>

                <div className="card bg-info text-info-content shadow-sm">
                    <div className="card-body p-4 sm:p-5">
                        <h3 className="text-xs sm:text-sm font-semibold opacity-80">Last 30 Days</h3>
                        <p className="text-2xl sm:text-3xl font-bold">{data.stats?.enrollmentsLast30Days || 0}</p>
                    </div>
                </div>
            </div>

            {/* Enrollments Over Time Chart */}
            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                <div className="card-body p-3 sm:p-6">
                    <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-base-content">
                        Enrollments Over Time (Last 30 Days)
                    </h2>

                    {/* Horizontal scroll wrapper for small mobile screens */}
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[500px] h-[280px] sm:h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.chartData || []} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 11 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={50}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            border: "1px solid #ccc"
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
                                    <Line
                                        type="monotone"
                                        dataKey="enrollments"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Enrollments"
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Courses by Enrollments Chart */}
            {data.enrollmentsByCourse && data.enrollmentsByCourse.length > 0 && (
                <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                    <div className="card-body p-3 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-base-content">
                            Top Courses by Enrollments
                        </h2>

                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[500px] h-[300px] sm:h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.enrollmentsByCourse} margin={{ top: 10, right: 20, left: -10, bottom: 45 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="courseName"
                                            tick={({ x, y, payload }) => (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text
                                                        x={0}
                                                        y={0}
                                                        dy={10}
                                                        textAnchor="end"
                                                        fill="#666"
                                                        transform="rotate(-45)"
                                                        fontSize={11}
                                                    >
                                                        {payload.value.length > 15
                                                            ? `${payload.value.substring(0, 15)}...`
                                                            : payload.value}
                                                    </text>
                                                </g>
                                            )}
                                            height={60}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                border: "1px solid #ccc"
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
                                        <Bar dataKey="enrollments" fill="#82ca9d" name="Enrollments" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="card bg-base-200 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <h3 className="text-xs sm:text-base font-semibold mb-2 text-base-content">
                            Platform Statistics
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Total Instructors:</span>
                                <span className="font-bold text-base-content">{data.stats?.totalInstructors || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Average Enrollments per Course:</span>
                                <span className="font-bold text-base-content">
                                    {data.stats?.totalCourses > 0
                                        ? Math.round(data.stats.totalEnrollments / data.stats.totalCourses)
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-200 border border-base-300 shadow-sm">
                    <div className="card-body p-4 sm:p-6">
                        <h3 className="text-xs sm:text-base font-semibold mb-2 text-base-content">
                            Growth Metrics
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Enrollments (Last 30 Days):</span>
                                <span className="font-bold text-primary">{data.stats?.enrollmentsLast30Days || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Daily Average:</span>
                                <span className="font-bold text-base-content">
                                    {Math.round(((data.stats?.enrollmentsLast30Days || 0) / 30) * 10) / 10}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}