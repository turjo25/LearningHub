import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { createCourse } from "../../services/courseService";
import { createEnrollment } from "../../services/enrollmentService";
import toast from "react-hot-toast";

function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("course");
  const [loading, setLoading] = useState(false);

  // Bug 4 fix: enforce admin-only access
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleCourseCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      title: event.target.title.value.trim(),
      description: event.target.description.value.trim(),
      // Bug 3 fix: API expects teacher ID (integer), not a name string
      teacher: parseInt(event.target.teacher.value.trim(), 10),
    };

    if (!values.title || !values.description || !values.teacher) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await createCourse(values);
      toast.success("Course created successfully!");
      event.target.reset();
    } catch (err) {
      toast.error(
        "Failed to create course: " +
          (err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            err.message)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEnrollmentCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      // Bug 3 fix: API expects integer IDs
      student: parseInt(event.target.student.value.trim(), 10),
      course: parseInt(event.target.course.value.trim(), 10),
    };

    if (!values.student || !values.course) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await createEnrollment(values);
      toast.success("Enrollment created successfully!");
      event.target.reset();
    } catch (err) {
      toast.error(
        "Failed to create enrollment: " +
          (err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            err.message)
      );
    } finally {
      setLoading(false);
    }
  }

  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-5 py-2.5 font-semibold rounded-xl transition-all duration-200 text-sm ${
        activeTab === name
          ? "bg-brand-600 text-white border border-brand-600"
          : "bg-white border border-[#e8e6ff] text-gray-600 hover:border-brand-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] py-10 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage courses and enrollments</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        <TabButton name="course" label="📚 Create Course" />
        <TabButton name="enrollment" label="📝 Create Enrollment" />
      </div>

      {/* Create Course */}
      {activeTab === "course" && (
        <div className="card p-8">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📚</span> Create Course
          </h2>
          <form onSubmit={handleCourseCreate} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">Course Title</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Introduction to Python"
                className="form-input w-full"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">Description</label>
              <textarea
                name="description"
                placeholder="Describe the course..."
                rows={3}
                className="form-input w-full resize-none"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">Teacher ID</label>
              <input
                name="teacher"
                type="number"
                placeholder="Enter the teacher's numeric ID"
                className="form-input w-full"
                disabled={loading}
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                You can find teacher IDs via the API at <code className="text-brand-600">/api/teacher/</code>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      )}

      {/* Create Enrollment */}
      {activeTab === "enrollment" && (
        <div className="card p-8">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📝</span> Create Enrollment
          </h2>
          <form onSubmit={handleEnrollmentCreate} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">Student ID</label>
              <input
                name="student"
                type="number"
                placeholder="Enter the student's numeric ID"
                className="form-input w-full"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5 font-medium">Course ID</label>
              <input
                name="course"
                type="number"
                placeholder="Enter the course's numeric ID"
                className="form-input w-full"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Enroll Student"}
            </button>
          </form>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-5 mt-8">
        {[
          { icon: "📚", title: "Courses", desc: "Create and manage course content" },
          { icon: "📝", title: "Enrollments", desc: "Manually enroll students in courses" },
        ].map((card) => (
          <div key={card.title} className="card p-6 text-center">
            <div className="text-4xl mb-3">{card.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-gray-600 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
