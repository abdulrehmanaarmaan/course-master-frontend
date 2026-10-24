import api from "./api";

export const enrollInCourse = (courseId, batchId = null) => {
    const payload =
        batchId !== null && batchId !== undefined
            ? { batchId }
            : {};

    return api.post(`/enrollments/${courseId}`, payload);
};

export const getMyEnrollments = () => {
    return api.get("/enrollments/my");
};

export const completeLesson = (enrollmentId, lessonId) => {
    return api.patch(
        `/enrollments/${enrollmentId}/complete-lesson`,
        { lessonId }
    );
};
