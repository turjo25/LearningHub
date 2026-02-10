import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import { getTeacherDetails } from "../services/teacherService";
import { createEnrollment } from "../services/enrollmentService";

function CourseDetails() {
  const id = useParams().id;
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState("");

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setError("");
        const c = await getCourseById(id);
        if (!c) {
          setError("Course not found");
          setIsLoading(false);
          return;
        }
        setCourse(c);

        if (c.teacher) {
          const teacherData = await getTeacherDetails(c.teacher);
          setTeacher(teacherData);
        }
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load course details. Please try again.");
        console.error("Fetch error:", err);
        setIsLoading(false);
      }
    }
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  async function handleEnroll() {
    try {
      setEnrolling(true);
      setError("");
      const res = await createEnrollment({ course: course.id });
      setEnrollSuccess("Successfully enrolled in the course!");
      setTimeout(() => {
        navigate("/courses");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Enrollment failed. Please try again.",
      );
      console.error("Enrollment error:", err);
    } finally {
      setEnrolling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-700 font-semibold text-lg">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-6xl mb-4 text-center">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {error}
          </h1>
          <button
            onClick={() => navigate("/courses")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/courses")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition duration-200"
        >
          ← Back to Courses
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <span className="text-red-600 text-2xl shrink-0">⚠️</span>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {enrollSuccess && (
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
            <span className="text-green-600 text-2xl shrink-0">✓</span>
            <p className="text-green-700 font-semibold">{enrollSuccess}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-64 flex items-center justify-center">
            <div className="text-8xl">📚</div>
          </div>

          {/* Course Content */}
          <div className="p-8 md:p-12">
            {/* Course Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {course?.title}
            </h1>

            {/* Course Description */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {course?.description}
            </p>

            {/* Divider */}
            <div className="my-8 h-px bg-gray-200"></div>

            {/* Course Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Information
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">
                      Course ID
                    </p>
                    <p className="text-lg text-gray-900 font-bold">
                      {course?.id}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">
                      Status
                    </p>
                    <p className="text-lg text-gray-900 font-bold">
                      <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Teacher Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Instructor
                </h2>
                {teacher ? (
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                    <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl mb-4">
                      👨‍🏫
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {teacher.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-xl">📚</span>
                      <p className="font-semibold">{teacher.subject}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 text-center">
                    <p className="text-gray-600">No instructor assigned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-gray-200"></div>

            {/* Course Highlights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What You'll Get
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Comprehensive Content
                    </p>
                    <p className="text-sm text-gray-600">
                      Complete course material and resources
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Flexible Schedule
                    </p>
                    <p className="text-sm text-gray-600">
                      Learn at your own pace
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Expert Instruction
                    </p>
                    <p className="text-sm text-gray-600">
                      Learn from industry professionals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">Certificate</p>
                    <p className="text-sm text-gray-600">
                      Earn a certificate upon completion
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enroll Button */}
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enrolling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>Enroll Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
