import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../../../store/slices/coursesSlice";
import { useNavigate, useParams } from "react-router-dom";
import { updateCourseAsync } from "../../../store/slices/adminSlice";

// <input type="datetime-local"> expects LOCAL time ("YYYY-MM-DDTHH:mm").
// toISOString() returns UTC, which shifts the shown time by the user's UTC offset.
const toDateTimeLocal = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const courseToForm = (course) => ({
    title: course.title || "",
    description: course.description || "",
    instructorName: course.instructorName || "",
    price: course.price || 0,
    category: course.category || "",
    tags: (course.tags || []).join(", "),
    batches: JSON.parse(JSON.stringify(course.batches || [])),
    syllabus: JSON.parse(JSON.stringify(course.syllabus || [])),
});

export default function EditCourse() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentCourse, detailLoading } = useSelector((state) => state.courses);
    const { creating, error } = useSelector((state) => state.admin);

    // The ID records which course has finished loading, avoiding synchronous
    // state updates in effects when the route changes.
    const [fetchedId, setFetchedId] = useState(null);

    const [formState, setFormState] = useState({
        courseId: null, values: {
            title: "",
            description: "",
            instructorName: "",
            price: 0,
            category: "",
            tags: "",
            batches: [],
            syllabus: [],
        }
    });

    const fetched = fetchedId === id;
    const freshCourse = fetched && currentCourse && currentCourse._id === id
        ? currentCourse
        : null;
    const form = formState.courseId === id
        ? formState.values
        : freshCourse
            ? courseToForm(freshCourse)
            : formState.values;

    const setForm = (update) => {
        setFormState((previous) => {
            const currentValues = previous.courseId === id
                ? previous.values
                : freshCourse
                    ? courseToForm(freshCourse)
                    : previous.values;
            return {
                courseId: id,
                values: typeof update === "function" ? update(currentValues) : update,
            };
        });
    };

    useEffect(() => {
        // Always refetch when the page opens. The store can still hold an older copy of
        // this course (from before the last save), so we must not skip the request.
        let cancelled = false;
        dispatch(fetchCourseById(id)).then(() => {
            if (!cancelled) setFetchedId(id);
        });
        return () => {
            cancelled = true;
        };
    }, [dispatch, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: name === "price" ? Number(value) : value }));
    };

    const addBatch = () => {
        setForm((s) => ({
            ...s,
            batches: [...s.batches, { name: "", startDate: "" }],
        }));
    };

    const removeBatch = (idx) => {
        setForm((s) => ({
            ...s,
            batches: s.batches.filter((_, i) => i !== idx),
        }));
    };

    const updateBatch = (idx, field, value) => {
        setForm((s) => {
            const newBatches = [...s.batches];
            newBatches[idx] = { ...newBatches[idx], [field]: value };
            return { ...s, batches: newBatches };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            title: form.title,
            description: form.description,
            instructorName: form.instructorName,
            price: form.price,
            category: form.category,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            batches: form.batches.map(b => ({
                ...b,
                startDate: b.startDate ? new Date(b.startDate) : undefined
            })),
            syllabus: form.syllabus,
        };

        dispatch(updateCourseAsync({ id, data: payload })).then((res) => {
            if (!res.error) {
                navigate("/admin/courses");
            }
        });
    };

    if (detailLoading || !fetched) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl min-w-0">
            <h1 className="page-heading mb-4 sm:mb-6">Edit Course</h1>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4 sm:space-y-5">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Course Title *</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter course title"
                        className="input input-bordered w-full min-w-0"
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Description *</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Course description"
                        className="textarea textarea-bordered h-28 w-full min-w-0"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Instructor Name *</span>
                        </label>
                        <input
                            type="text"
                            name="instructorName"
                            value={form.instructorName}
                            onChange={handleChange}
                            placeholder="Instructor name"
                            className="input input-bordered w-full min-w-0"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Price (৳) *</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Price in taka"
                            className="input input-bordered w-full min-w-0"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Category</span>
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="e.g., Web Development"
                            className="input input-bordered w-full min-w-0"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Tags (comma separated)</span>
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="react, javascript, web"
                            className="input input-bordered w-full min-w-0"
                        />
                    </div>
                </div>

                {/* Syllabus Section */}
                <div className="divider text-center text-sm sm:text-base">Course Syllabus (Modules & Lessons)</div>
                <div className="min-w-0 space-y-4">
                    {form.syllabus.map((module, modIdx) => (
                        <div key={modIdx} className="card min-w-0 bg-base-100 border border-base-300">
                            <div className="card-body min-w-0 p-3 sm:p-6">
                                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="font-bold text-lg">Module {modIdx + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSyllabus = form.syllabus.filter((_, i) => i !== modIdx);
                                            setForm({ ...form, syllabus: newSyllabus });
                                        }}
                                        className="btn btn-sm btn-error w-full sm:w-auto"
                                    >
                                        Remove Module
                                    </button>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-semibold">Module Title *</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={module.title || ""}
                                        onChange={(e) => {
                                            const newSyllabus = [...form.syllabus];
                                            newSyllabus[modIdx].title = e.target.value;
                                            setForm({ ...form, syllabus: newSyllabus });
                                        }}
                                        placeholder="e.g., Introduction to React"
                                        className="input input-bordered w-full min-w-0"
                                        required
                                    />
                                </div>

                                {/* Lessons */}
                                <div className="min-w-0 space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h4 className="font-semibold">Lessons</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSyllabus = [...form.syllabus];
                                                if (!newSyllabus[modIdx].lessons) {
                                                    newSyllabus[modIdx].lessons = [];
                                                }
                                                newSyllabus[modIdx].lessons.push({
                                                    title: "",
                                                    videoUrl: "",
                                                    liveClassLink: "",
                                                    liveClassDate: "",
                                                    assignmentPrompt: "",
                                                    quiz: [],
                                                });
                                                setForm({ ...form, syllabus: newSyllabus });
                                            }}
                                            className="btn btn-sm btn-outline w-full sm:w-auto"
                                        >
                                            + Add Lesson
                                        </button>
                                    </div>

                                    {module.lessons?.map((lesson, lesIdx) => (
                                        <div key={lesIdx} className="card min-w-0 bg-base-200 border border-base-300">
                                            <div className="card-body min-w-0 p-3 sm:p-6">
                                                <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <h5 className="font-semibold">Lesson {lesIdx + 1}</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSyllabus = [...form.syllabus];
                                                            newSyllabus[modIdx].lessons = newSyllabus[modIdx].lessons.filter((_, i) => i !== lesIdx);
                                                            setForm({ ...form, syllabus: newSyllabus });
                                                        }}
                                                        className="btn btn-xs btn-error w-full sm:w-auto"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="min-w-0 space-y-3">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Lesson Title *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={lesson?.title || ""}
                                                            onChange={(e) => {
                                                                const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                    if (mIdx === modIdx) {
                                                                        const newLessons = mod.lessons.map((les, lIdx) => {
                                                                            if (lIdx === lesIdx) {
                                                                                return { ...les, title: e.target.value };
                                                                            }
                                                                            return les;
                                                                        });
                                                                        return { ...mod, lessons: newLessons };
                                                                    }
                                                                    return mod;
                                                                });
                                                                setForm({ ...form, syllabus: newSyllabus });
                                                            }}
                                                            placeholder="e.g., Setting up React"
                                                            className="input input-bordered input-sm w-full min-w-0"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Video URL (YouTube) *</span>
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={lesson?.videoUrl || ""}
                                                            onChange={(e) => {
                                                                const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                    if (mIdx === modIdx) {
                                                                        const newLessons = mod.lessons.map((les, lIdx) => {
                                                                            if (lIdx === lesIdx) {
                                                                                return { ...les, videoUrl: e.target.value };
                                                                            }
                                                                            return les;
                                                                        });
                                                                        return { ...mod, lessons: newLessons };
                                                                    }
                                                                    return mod;
                                                                });
                                                                setForm({ ...form, syllabus: newSyllabus });
                                                            }}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className="input input-bordered input-sm w-full min-w-0"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Live Class Section */}
                                                    <div className="form-control">
                                                        <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <label className="label py-0">
                                                                <span className="label-text font-semibold">Live Class (Optional)</span>
                                                            </label>
                                                            {lesson?.liveClassLink === undefined ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        return {
                                                                                            ...les,
                                                                                            liveClassLink: "",
                                                                                            liveClassDate: ""
                                                                                        };
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    className="btn btn-sm btn-outline btn-info w-full sm:w-auto"
                                                                >
                                                                    + Add Live Class
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        const { liveClassLink, liveClassDate: _liveClassDate, ...rest } = les;
                                                                                        return rest;
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    className="btn btn-sm btn-ghost btn-error w-full sm:w-auto"
                                                                >
                                                                    Remove Live Class
                                                                </button>
                                                            )}
                                                        </div>
                                                        {lesson?.liveClassLink !== undefined && (
                                                            <div className="min-w-0 space-y-2">
                                                                <input
                                                                    type="url"
                                                                    value={lesson?.liveClassLink || ""}
                                                                    onChange={(e) => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        return {
                                                                                            ...les,
                                                                                            liveClassLink: e.target.value
                                                                                        };
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/xxxxx"
                                                                    className="input input-bordered input-sm w-full min-w-0"
                                                                />
                                                                <input
                                                                    type="datetime-local"
                                                                    value={toDateTimeLocal(lesson?.liveClassDate)}
                                                                    onChange={(e) => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        return {
                                                                                            ...les,
                                                                                            liveClassDate: e.target.value ? new Date(e.target.value).toISOString() : ""
                                                                                        };
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    className="input input-bordered input-sm w-full min-w-0"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Assignment Section */}
                                                    <div className="form-control">
                                                        <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <label className="label py-0">
                                                                <span className="label-text font-semibold">Assignment</span>
                                                            </label>
                                                            {lesson?.assignmentPrompt === undefined ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        return {
                                                                                            ...les,
                                                                                            assignmentPrompt: ""
                                                                                        };
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    className="btn btn-sm btn-outline btn-secondary w-full sm:w-auto"
                                                                >
                                                                    + Add Assignment
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                            if (mIdx === modIdx) {
                                                                                const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                    if (lIdx === lesIdx) {
                                                                                        const updatedLesson = { ...les };
                                                                                        delete updatedLesson.assignmentPrompt;
                                                                                        return updatedLesson;
                                                                                    }
                                                                                    return les;
                                                                                });
                                                                                return { ...mod, lessons: newLessons };
                                                                            }
                                                                            return mod;
                                                                        });
                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                    }}
                                                                    className="btn btn-sm btn-ghost btn-error w-full sm:w-auto"
                                                                >
                                                                    Remove Assignment
                                                                </button>
                                                            )}
                                                        </div>
                                                        {lesson?.assignmentPrompt !== undefined && (
                                                            <textarea
                                                                value={lesson?.assignmentPrompt || ""}
                                                                onChange={(e) => {
                                                                    const newSyllabus = form.syllabus.map((mod, mIdx) => {
                                                                        if (mIdx === modIdx) {
                                                                            const newLessons = mod.lessons.map((les, lIdx) => {
                                                                                if (lIdx === lesIdx) {
                                                                                    return {
                                                                                        ...les,
                                                                                        assignmentPrompt: e.target.value
                                                                                    };
                                                                                }
                                                                                return les;
                                                                            });
                                                                            return {
                                                                                ...mod,
                                                                                lessons: newLessons
                                                                            };
                                                                        }
                                                                        return mod;
                                                                    });
                                                                    setForm({ ...form, syllabus: newSyllabus });
                                                                }}
                                                                placeholder="Enter assignment instructions..."
                                                                className="textarea textarea-bordered textarea-sm w-full min-w-0"
                                                                rows="3"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Quiz Section */}
                                                    <div className="form-control">
                                                        <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <label className="label">
                                                                <span className="label-text">Quiz Questions (Optional)</span>
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSyllabus = [...form.syllabus];
                                                                    if (!newSyllabus[modIdx].lessons[lesIdx].quiz) {
                                                                        newSyllabus[modIdx].lessons[lesIdx].quiz = [];
                                                                    }
                                                                    newSyllabus[modIdx].lessons[lesIdx].quiz.push({
                                                                        question: "",
                                                                        options: ["", "", "", ""],
                                                                        correctIndex: 0,
                                                                    });
                                                                    setForm({ ...form, syllabus: newSyllabus });
                                                                }}
                                                                className="btn btn-xs btn-outline w-full sm:w-auto"
                                                            >
                                                                + Add Question
                                                            </button>
                                                        </div>

                                                        {lesson.quiz?.map((quizItem, qIdx) => (
                                                            <div key={qIdx} className="card min-w-0 bg-base-300 border border-base-400 mb-2">
                                                                <div className="card-body min-w-0 p-3">
                                                                    <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                                                        <span className="text-sm font-semibold">Question {qIdx + 1}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newSyllabus = [...form.syllabus];
                                                                                newSyllabus[modIdx].lessons[lesIdx].quiz = newSyllabus[modIdx].lessons[lesIdx].quiz.filter((_, i) => i !== qIdx);
                                                                                setForm({ ...form, syllabus: newSyllabus });
                                                                            }}
                                                                            className="btn btn-xs btn-error w-full sm:w-auto"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>

                                                                    <input
                                                                        type="text"
                                                                        value={quizItem.question || ""}
                                                                        onChange={(e) => {
                                                                            const newSyllabus = [...form.syllabus];
                                                                            newSyllabus[modIdx].lessons[lesIdx].quiz[qIdx].question = e.target.value;
                                                                            setForm({ ...form, syllabus: newSyllabus });
                                                                        }}
                                                                        placeholder="Enter question"
                                                                        className="input input-bordered input-sm mb-2 w-full min-w-0"
                                                                    />

                                                                    <div className="space-y-1">
                                                                        {quizItem.options?.map((option, optIdx) => (
                                                                            <div key={optIdx} className="flex items-center gap-2 min-w-0">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`quiz-${modIdx}-${lesIdx}-${qIdx}`}
                                                                                    checked={quizItem.correctIndex === optIdx}
                                                                                    onChange={() => {
                                                                                        const newSyllabus = [...form.syllabus];
                                                                                        newSyllabus[modIdx].lessons[lesIdx].quiz[qIdx].correctIndex = optIdx;
                                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                                    }}
                                                                                    className="radio radio-xs"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={option || ""}
                                                                                    onChange={(e) => {
                                                                                        const newSyllabus = [...form.syllabus];
                                                                                        newSyllabus[modIdx].lessons[lesIdx].quiz[qIdx].options[optIdx] = e.target.value;
                                                                                        setForm({ ...form, syllabus: newSyllabus });
                                                                                    }}
                                                                                    placeholder={`Option ${optIdx + 1}`}
                                                                                    className="input input-bordered input-sm w-full min-w-0 sm:flex-1"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            setForm({
                                ...form,
                                syllabus: [...form.syllabus, { title: "", lessons: [] }],
                            });
                        }}
                        className="btn btn-outline btn-sm w-full"
                    >
                        + Add Module
                    </button>
                </div>

                {/* Batches Section */}
                <div className="divider text-center text-sm sm:text-base">Batches (Optional)</div>
                <div className="min-w-0 space-y-3">
                    {form.batches.map((batch, idx) => (
                        <div key={idx} className="card min-w-0 bg-base-100 border border-base-300">
                            <div className="card-body min-w-0 p-3 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Batch Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={batch.name || ""}
                                            onChange={(e) => updateBatch(idx, "name", e.target.value)}
                                            placeholder="e.g., Batch 1, Jan 2025"
                                            className="input input-bordered input-sm w-full min-w-0"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Start Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={batch.startDate ? (typeof batch.startDate === 'string' ? batch.startDate.split("T")[0] : new Date(batch.startDate).toISOString().split("T")[0]) : ""}
                                            onChange={(e) => updateBatch(idx, "startDate", e.target.value)}
                                            className="input input-bordered input-sm w-full min-w-0"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeBatch(idx)}
                                    className="btn btn-sm btn-error mt-2 w-full sm:w-auto"
                                >
                                    Remove Batch
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addBatch}
                        className="btn btn-outline btn-sm w-full sm:w-auto"
                    >
                        + Add Batch
                    </button>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
                    <button
                        type="submit"
                        disabled={creating}
                        className="btn btn-primary w-full min-w-0 sm:flex-1"
                    >
                        {creating ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Updating...
                            </>
                        ) : (
                            "Update Course"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/courses")}
                        className="btn btn-outline w-full sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
