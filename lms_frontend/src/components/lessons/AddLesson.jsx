import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getTeacherByUser } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { PlayCircle, BookOpen, ArrowRight, LayoutList } from "lucide-react";

export default function AddLesson() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadCourses();
  }, [user]);

  async function loadCourses() {
    try {
      setLoading(true);
      const teacherData = await getTeacherByUser(user.user_id);
      if (teacherData) {
        const myCourses = await getCourses({ teacher: teacherData.id });
        setCourses(myCourses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-6">
        <div className="w-48 h-8 rounded-lg shimmer" />
        <div className="grid sm:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto page-enter">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900">Add Lesson</h1>
            <p className="text-slate-500 font-medium">Select a course to add new lessons or manage existing ones.</p>
          </div>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="text-center py-16 glass-panel">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Courses Found</h2>
          <p className="text-slate-500 mb-6">You need to create a course before you can add lessons to it.</p>
          <Link to="/courses/new" className="btn-primary">Create a Course</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}/manage`}
              className="glass-panel p-6 flex flex-col hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{course.level || "Beginner"}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-brand-600">
                <span className="flex items-center gap-1.5"><LayoutList className="w-4 h-4" /> Manage Lessons</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
