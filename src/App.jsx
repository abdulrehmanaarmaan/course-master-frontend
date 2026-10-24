import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "./layouts/MainLayout";

// Public pages
import Home from "./pages/Home/Home";
import Courses from "./pages/Courses/Courses";
import CourseDetails from "./pages/CourseDetails/CourseDetails";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import About from "./pages/About/About";

// Route guards
import GuestRoute from "./routes/GuestRoute";
import StudentRoute from "./routes/StudentRoute";
import AdminRoute from "./routes/AdminRoute";

// Student course player
import StudentCoursePlayer from "./pages/StudentCoursePlayer/StudentCoursePlayer";
import Profile from "./pages/Profile/Profile";
import StudentEnrolledCourses from "./pages/student/pages/StudentEnrolledCourses";
import DashboardLayoutSkeleton from "./components/Loaders/DashboardLayoutSkeleton";
import DashboardContentSkeleton from "./components/Loaders/DashboardContentSkeleton";
import Unauthorized from "./pages/Unauthorized/Unauthorized";

// Lazy-loaded student and admin pages
const StudentDashboard = lazy(
  () => import("./pages/student/components/StudentDashboard")
);

const AdminDashboard = lazy(
  () => import("./pages/admin/components/AdminDashboard")
);

const AdminOverview = lazy(
  () => import("./pages/admin/pages/AdminOverview")
);

const ManageCourses = lazy(
  () => import("./pages/admin/pages/ManageCourses")
);

const Enrollments = lazy(
  () => import("./pages/admin/pages/Enrollments")
);

const Assignments = lazy(
  () => import("./pages/admin/pages/Assignments")
);

const Analytics = lazy(
  () => import("./pages/admin/pages/Analytics")
);

const CreateCourse = lazy(
  () => import("./pages/admin/pages/CreateCourse")
);

const EditCourse = lazy(
  () => import("./pages/admin/pages/EditCourse")
);

const ManageUsers = lazy(
  () => import("./pages/admin/pages/ManageUsers")
);

const VideoClasses = lazy(
  () => import("./pages/admin/pages/VideoClasses")
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public website layout: public navbar and footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Public-layout fallback */}
          <Route path="*" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Student routes: outside the public layout */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <Suspense fallback={<DashboardLayoutSkeleton role="student" />}>
                <StudentDashboard />
              </Suspense>
            </StudentRoute>
          }
        >

          <Route
            index
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <StudentEnrolledCourses />
              </Suspense>
            }
          />

          <Route
            path="profile"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>

        {/* Course player: protected, without the public navbar/footer */}
        <Route
          path="/courses/:courseId/player"
          element={
            <StudentRoute>
              <StudentCoursePlayer />
            </StudentRoute>
          }
        />

        {/* Admin routes: protected, outside the public layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardLayoutSkeleton role="admin" />}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <AdminOverview />
              </Suspense>
            }
          />

          <Route
            path="courses/create"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <CreateCourse />
              </Suspense>
            }
          />

          <Route
            path="courses/edit/:id"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <EditCourse />
              </Suspense>
            }
          />

          <Route
            path="video-classes"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <VideoClasses />
              </Suspense>
            }
          />

          <Route
            path="enrollments"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <Enrollments />
              </Suspense>
            }
          />

          <Route
            path="courses"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <ManageCourses />
              </Suspense>
            }
          />

          <Route
            path="assignments"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <Assignments />
              </Suspense>
            }
          />

          <Route
            path="analytics"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <Analytics />
              </Suspense>
            }
          />

          <Route
            path="users"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <ManageUsers />
              </Suspense>
            }
          />

          <Route
            path="profile"
            element={
              <Suspense fallback={<DashboardContentSkeleton />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>

        {/* Global fallback for unmatched dashboard/player routes */}
        <Route path="*" element={<NotFound />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}