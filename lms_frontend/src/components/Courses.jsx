import { React, useEffect, useState } from "react";
import { getCourses } from "../services/courseService";
import { Link } from "react-router-dom";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const cs = await getCourses();
        setCourses(cs || []);
        setError("");
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error("Fetch courses error:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-700 font-semibold text-lg">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Courses</h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive collection of courses
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 bg-white text-lg"
            />
            <span className="absolute right-4 top-4 text-2xl">🔍</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg flex items-start gap-3">
            <span className="text-blue-600 text-2xl flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-blue-700 font-semibold text-lg">
                Register or Login to Explore Courses
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Sign in to your account to access and enroll in our courses
              </p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-2xl text-gray-600 font-semibold mb-2">
              {searchTerm
                ? "No courses match your search"
                : "No courses available"}
            </p>
            <p className="text-gray-500">
              {searchTerm
                ? "Try searching with different keywords"
                : "Check back soon for more courses"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 overflow-hidden"
              >
                {/* Course Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-48 flex items-center justify-center">
                  <div className="text-6xl">📖</div>
                </div>

                {/* Course Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-blue-600 font-semibold">
                      Course ID: {course.id}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Counter */}
        {filteredCourses.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 font-medium">
              Showing{" "}
              <span className="font-bold text-blue-600">
                {filteredCourses.length}
              </span>{" "}
              course{filteredCourses.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
