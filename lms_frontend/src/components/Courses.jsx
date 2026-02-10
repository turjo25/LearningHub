import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/lmsService";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="my-6 px-4 md:px-12">
      <h2 className="font-bold text-2xl mb-6">Courses</h2>
      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-4 rounded-lg bg-gray-100 w-full max-w-[280px] shadow-sm"
            >
              <div className="font-bold text-lg">{course.title}</div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {course.description}
              </div>
              {course.instructor_name && (
                <div className="text-xs text-gray-500 mt-2">
                  Instructor: {course.instructor_name}
                </div>
              )}
              <Link
                className="inline-block mt-2 text-blue-600 hover:underline font-medium"
                to={`/courses/${course.id}`}
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
