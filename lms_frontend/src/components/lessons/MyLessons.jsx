import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getStudentByUser } from "../../services/studentService";
import { getEnrollments } from "../../services/enrollmentService";
import { getCourseById } from "../../services/courseService";
import { getLessonsByCourse } from "../../services/lessonService";
import { getProgress } from "../../services/progressService";
import { PlayCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MyLessons() {
  const { user } = useAuth();
  const [coursesWithLessons, setCoursesWithLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const studentData = await getStudentByUser(user.user_id);
      if (!studentData) return;

      const enrollmentData = await getEnrollments({ student: studentData.id });
      const enrolledCourseIds = enrollmentData.map((e) => e.course);
      
      const courses = await Promise.all(
        enrolledCourseIds.map((id) => getCourseById(id).catch(() => null))
      );
      const validCourses = courses.filter(Boolean);

      const coursesData = await Promise.all(
        validCourses.map(async (course) => {
          const [lessons, progressData] = await Promise.all([
            getLessonsByCourse(course.id).catch(() => []),
            getProgress({ student: studentData.id, course: course.id }).catch(() => [])
          ]);
          
          const completedLessonIds = new Set(progressData.filter(p => p.completed).map(p => p.lesson));
          
          const lessonsWithStatus = lessons.map(lesson => ({
            ...lesson,
            completed: completedLessonIds.has(lesson.id)
          }));

          return { ...course, lessons: lessonsWithStatus };
        })
      );
      setCoursesWithLessons(coursesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex justify-center mt-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2 flex items-center gap-3">
          <PlayCircle className="w-8 h-8 text-brand-600" />
          My Lessons
        </h1>
        <p className="text-slate-500">All available lessons from your enrolled courses.</p>
      </div>

      {coursesWithLessons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Lessons Found</h2>
          <p className="text-slate-500">You aren't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary mt-6">Browse Courses</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {coursesWithLessons.map(course => (
            <div key={course.id} className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{course.title}</h2>
                  <p className="text-sm text-slate-500">{course.lessons.length} lessons</p>
                </div>
                <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-full transition-colors">
                  Go to Course
                </Link>
              </div>
              <div className="p-2 sm:p-6 grid gap-3">
                {course.lessons.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4 text-center">No lessons added to this course yet.</p>
                ) : (
                  course.lessons.sort((a, b) => a.order - b.order).map(lesson => (
                    <Link
                      key={lesson.id}
                      to={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lesson.completed ? 'bg-green-100 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                        {lesson.completed ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{lesson.title}</h3>
                      </div>
                      {lesson.completed && (
                        <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                          Completed
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
