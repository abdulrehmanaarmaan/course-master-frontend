
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    enrollInCourse,
    getMyEnrollments,
    completeLesson,
} from "../../services/enrollment.api";

export const enrollCourseAsync = createAsyncThunk(
    "enrollment/enrollCourse",
    async ({ courseId, batchId }, { rejectWithValue }) => {
        try {
            const res = await enrollInCourse(courseId, batchId);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to enroll"
            );
        }
    }
);

export const fetchMyEnrollments = createAsyncThunk(
    "enrollment/fetchMyEnrollments",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMyEnrollments();
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to load enrollments"
            );
        }
    }
);

export const completeLessonAsync = createAsyncThunk(
    "enrollment/completeLesson",
    async ({ enrollmentId, lessonId }, { rejectWithValue }) => {
        try {
            const res = await completeLesson(enrollmentId, lessonId);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to complete lesson"
            );
        }
    }
);

const enrollmentSlice = createSlice({
    name: "enrollment",

    initialState: {
        enrollments: [],
        loading: false,
        enrolling: false,
        error: null,
        success: null,
    },

    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        clearSuccess: (state) => {
            state.success = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // Enroll in a course
            .addCase(enrollCourseAsync.pending, (state) => {
                state.enrolling = true;
                state.error = null;
                state.success = null;
            })
            .addCase(enrollCourseAsync.fulfilled, (state, action) => {
                state.enrolling = false;
                state.success = "Successfully enrolled!";
                state.error = null;

                const newEnrollment = action.payload;

                if (
                    newEnrollment?._id &&
                    !state.enrollments.some(
                        (enrollment) => enrollment._id === newEnrollment._id
                    )
                ) {
                    state.enrollments.push(newEnrollment);
                }
            })
            .addCase(enrollCourseAsync.rejected, (state, action) => {
                state.enrolling = false;
                state.error = action.payload || "Failed to enroll";
            })

            // Fetch the current student's enrollments
            .addCase(fetchMyEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
                state.loading = false;

                // The thunk already returns res.data, which is the array.
                state.enrollments = Array.isArray(action.payload)
                    ? action.payload
                    : [];

                state.error = null;
            })
            .addCase(fetchMyEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || "Failed to load enrollments";
            })

            // Mark a lesson as completed
            .addCase(completeLessonAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(completeLessonAsync.fulfilled, (state, action) => {
                state.success = "Lesson marked complete!";

                const updatedEnrollment = action.payload;

                if (!updatedEnrollment?._id) return;

                const index = state.enrollments.findIndex(
                    (enrollment) =>
                        enrollment._id === updatedEnrollment._id
                );

                if (index !== -1) {
                    state.enrollments[index] = {
                        ...state.enrollments[index],
                        ...updatedEnrollment,
                    };
                }
            })
            .addCase(completeLessonAsync.rejected, (state, action) => {
                state.error =
                    action.payload || "Failed to complete lesson";
            });
    },
});

export const { clearError, clearSuccess } = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
