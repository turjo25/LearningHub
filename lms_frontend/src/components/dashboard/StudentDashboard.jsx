import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getStudentByUser } from "../../services/studentService";
import { getEnrollments } from "../../services/enrollmentService";
import { getCourseById } from "../../services/courseService";
import { getAssignments } from "../../services/assignmentService";
import { getSubmissions } from "../../services/submissionService";
import { getProgress } from "../../services/progressService";
import { getLessonsByCourse } from "../../services/lessonService";
import { BookOpen, Calendar, CheckCircle, TrendingUp, Search, User, Play, Clock, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const studentData = await getStudentByUser(user.user_id);
      if (!studentData) {
        setError("Student profile not found.");
        setLoading(false);
        return;
      }
      setStudent(studentData);

      const enrollmentData = await getEnrollments({ student: studentData.id });
      setEnrollments(enrollmentData);

      const enrolledCourseIds = enrollmentData.map((e) => e.course);
      const coursePromises = enrolledCourseIds.map((id) => getCourseById(id).catch(() => null));
      const myCourses = (await Promise.all(coursePromises)).filter(Boolean);
      setEnrolledCourses(myCourses);

      const assignmentPromises = myCourses.map((c) =>
        getAssignments({ course: c.id }).catch(() => [])
      );
      const assignmentArrays = await Promise.all(assignmentPromises);
      const allAssignments = assignmentArrays.flat();
      const now = new Date();
      const upcoming = allAssignments
        .filter((a) => new Date(a.due_date) >= now)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);
      setUpcomingAssignments(upcoming);

      const subData = await getSubmissions({ student: studentData.id });
      setSubmissions(subData);

      const progressMap = {};
      await Promise.all(
        myCourses.map(async (course) => {
          try {
            const [lessons, progress] = await Promise.all([
              getLessonsByCourse(course.id),
              getProgress({ student: studentData.id, course: course.id }),
            ]);
            const total = lessons.length;
            const completed = progress.filter((p) => p.completed).length;
            progressMap[course.id] = { completed, total };
          } catch {
            progressMap[course.id] = { completed: 0, total: 0 };
          }
        })
      );
      setCourseProgress(progressMap);

    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  function getDaysUntil(dateStr) {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `${diff}d left`;
  }

  function getUrgencyBadge(dateStr) {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) return "badge-red";
    if (diff <= 3) return "badge-yellow";
    return "badge-brand";
  }

  const totalLessons = Object.values(courseProgress).reduce((acc, p) => acc + p.total, 0);
  const totalCompleted = Object.values(courseProgress).reduce((acc, p) => acc + p.completed, 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen p-4 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl shimmer" />
          <div className="space-y-3">
            <div className="h-8 shimmer rounded-full w-64" />
            <div className="h-4 shimmer rounded-full w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl border border-slate-100 shimmer" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-2xl border border-slate-100 shimmer" />
          <div className="space-y-6">
            <div className="h-64 rounded-2xl border border-slate-100 shimmer" />
            <div className="h-48 rounded-2xl border border-slate-100 shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto page-enter space-y-8">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
            <span className="text-3xl">🎓</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-slate-500 font-medium mt-1">Here's what's happening with your learning journey today.</p>
          </div>
        </div>
        <Link to="/courses" className="btn-primary shrink-0">
          <Search className="w-4 h-4" /> Browse Courses
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { label: "Enrolled Courses", value: enrolledCourses.length, icon: BookOpen, color: "text-brand-500", bg: "bg-brand-50" },
          { label: "Assignments Due", value: upcomingAssignments.length, icon: Calendar, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Submissions", value: submissions.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Overall Progress", value: `${overallProgress}%`, icon: TrendingUp, color: "text-accent-500", bg: "bg-accent-50" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left column (Courses) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" /> Active Courses
              </h2>
              <Link to="/my-lessons" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No courses yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start your learning journey by enrolling in a course that interests you.</p>
                <Link to="/courses" className="btn-primary">Explore Catalog</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map(course => {
                  const prog = courseProgress[course.id] || { completed: 0, total: 0 };
                  const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                  const isCompleted = pct === 100;
                  
                  return (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden shrink-0 relative bg-brand-100">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-brand-300" /></div>
                        )}
                        {/* Overlay play button */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-brand-600 fill-brand-600 ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{course.category_name || "General"} • {course.level || "All Levels"}</p>
                        
                        {prog.total > 0 ? (
                          <div className="mt-auto">
                            <div className="flex justify-between text-xs font-semibold mb-1.5">
                              <span className="text-slate-500">{prog.completed} of {prog.total} lessons</span>
                              <span className={isCompleted ? "text-green-600" : "text-brand-600"}>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? "bg-green-500" : "bg-brand-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mt-auto italic">No lessons available yet</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          
          {/* Assignments */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" /> Due Soon
              </h2>
            </div>
            
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map(a => (
                  <Link
                    key={a.id}
                    to={`/assignments/${a.id}`}
                    className="block p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition-all duration-200"
                  >
                    <p className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1">{a.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(a.due_date)}
                      </span>
                      <span className={`badge ${getUrgencyBadge(a.due_date)}`}>
                        {getDaysUntil(a.due_date)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-display font-bold text-slate-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Edit Profile</span>
              </Link>
              <Link to="/my-assignments" className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">All Assignments</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
