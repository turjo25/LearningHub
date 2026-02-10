import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, enrollInCourse } from "../services/lmsService";
import { useAuth } from "../contexts/AuthProvider";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCourseById(id)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user || !course) return;
    setEnrollError("");
    setEnrolling(true);
    try {
      await enrollInCourse(course.id);
      setEnrolled(true);
    } catch (err) {
      setEnrollError(
        err.response?.data?.error || err.message || "Enrollment failed",
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <div className="p-8">Course not found.</div>;

  const canEnroll = user?.role === "student" && !enrolled;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="mt-2 text-gray-700">{course.description}</p>
      {course.instructor_name && (
        <p className="mt-2 text-sm text-gray-600">
          Instructor: {course.instructor_name}
        </p>
      )}
      {course.category_name && (
        <p className="mt-1 text-sm text-gray-600">
          Category: {course.category_name}
        </p>
      )}
      {enrollError && <p className="mt-2 text-red-600">{enrollError}</p>}
      {canEnroll && (
        <button
          type="button"
          onClick={handleEnroll}
          disabled={enrolling}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {enrolling ? "Enrolling..." : "Enroll now"}
        </button>
      )}
      {enrolled && (
        <p className="mt-4 text-green-600 font-medium">
          You are enrolled in this course.
        </p>
      )}
      {user?.role !== "student" && user?.role !== "admin" && !enrolled && (
        <p className="mt-4 text-gray-500">
          Only students can self-enroll. Contact admin for enrollment.
        </p>
      )}
    </div>
  );
}
