import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import {
  getDashboardSummary,
  getCourses,
  getCategories,
  getInstructors,
  createCourse,
  createCategory,
  getEnrollments,
} from "../services/lmsService";

export default function Admin() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getDashboardSummary().catch(() => null),
      getCourses().catch(() => []),
      getCategories().catch(() => []),
      user?.role === "admin"
        ? getInstructors().catch(() => [])
        : Promise.resolve([]),
      getEnrollments().catch(() => []),
    ])
      .then(([sum, crs, cat, inst, enr]) => {
        setSummary(sum || {});
        setCourses(Array.isArray(crs) ? crs : []);
        setCategories(Array.isArray(cat) ? cat : []);
        setInstructors(Array.isArray(inst) ? inst : []);
        setEnrollments(Array.isArray(enr) ? enr : []);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = e.target;
    const payload = {
      title: form.title?.value?.trim(),
      description: form.description?.value?.trim() || "",
      category: form.category?.value ? parseInt(form.category.value, 10) : null,
      instructor:
        user?.role === "instructor"
          ? user.id
          : parseInt(form.instructor?.value, 10),
    };
    if (!payload.title) {
      setError("Title is required");
      return;
    }
    if (user?.role === "admin" && !payload.instructor) {
      setError("Select an instructor");
      return;
    }
    try {
      await createCourse(payload);
      setMessage("Course created.");
      loadData();
      form.reset();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Create failed");
    }
  };

  if (loading && !summary) return <div className="p-8">Loading...</div>;

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total users</div>
            <div className="text-2xl font-bold">{summary.total_users ?? 0}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total courses</div>
            <div className="text-2xl font-bold">
              {summary.total_courses ?? 0}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total enrollments</div>
            <div className="text-2xl font-bold">
              {summary.total_enrollments ?? 0}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Users by role</div>
            <div className="text-sm">
              Admin: {summary.users_by_role?.admin ?? 0}, Instructor:{" "}
              {summary.users_by_role?.instructor ?? 0}, Student:{" "}
              {summary.users_by_role?.student ?? 0}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {/* Course creation: Admin or Instructor */}
      {(user?.role === "admin" || user?.role === "instructor") && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Create course</h2>
          <form
            onSubmit={handleCreateCourse}
            className="flex flex-col gap-4 max-w-md"
          >
            <input
              name="title"
              type="text"
              placeholder="Course title"
              className="p-2 border rounded-md"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="p-2 border rounded-md"
              rows={3}
            />
            <select name="category" className="p-2 border rounded-md">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {user?.role === "admin" && (
              <select
                name="instructor"
                className="p-2 border rounded-md"
                required
              >
                <option value="">Select instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.username} ({i.email})
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-fit"
            >
              Add course
            </button>
          </form>
        </section>
      )}

      {/* Category management: Admin only */}
      {user?.role === "admin" && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <form
            className="flex flex-col gap-2 max-w-md mb-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target.catName?.value?.trim();
              if (!name) return;
              try {
                await createCategory(
                  name,
                  e.target.catDesc?.value?.trim() || "",
                );
                setMessage("Category created.");
                loadData();
                e.target.reset();
              } catch (err) {
                setError(err.response?.data?.detail || "Failed");
              }
            }}
          >
            <input
              name="catName"
              type="text"
              placeholder="Category name"
              className="p-2 border rounded-md"
              required
            />
            <input
              name="catDesc"
              type="text"
              placeholder="Description (optional)"
              className="p-2 border rounded-md"
            />
            <button
              type="submit"
              className="bg-gray-700 text-white p-2 rounded-md w-fit"
            >
              Add category
            </button>
          </form>
          <ul className="list-disc pl-6">
            {categories.map((c) => (
              <li key={c.id}>
                {c.name} – {c.description || "—"}
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-gray-500">None yet.</li>
            )}
          </ul>
        </section>
      )}

      {/* Courses list */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Courses</h2>
        <div className="space-y-2">
          {courses.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-gray-100 rounded-md flex justify-between items-center"
            >
              <span className="font-medium">{c.title}</span>
              <span className="text-sm text-gray-600">
                {c.instructor_name || c.instructor}
              </span>
            </div>
          ))}
          {courses.length === 0 && <p className="text-gray-500">No courses.</p>}
        </div>
      </section>

      {/* Enrollments (admin/instructor) */}
      {(user?.role === "admin" || user?.role === "instructor") && (
        <section>
          <h2 className="text-xl font-bold mb-4">Recent enrollments</h2>
          <div className="space-y-2">
            {enrollments.slice(0, 20).map((e) => (
              <div key={e.id} className="p-3 bg-gray-50 rounded text-sm">
                {e.user_username ?? e.user} → {e.course_title ?? e.course}
              </div>
            ))}
            {enrollments.length === 0 && (
              <p className="text-gray-500">No enrollments.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
