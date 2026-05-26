import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getTeacherByUser } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { getEnrollments } from "../../services/enrollmentService";
import { getSubmissions } from "../../services/submissionService";
import { getAssignments } from "../../services/assignmentService";
import { BookOpen, Users, ClipboardList, PenTool, Edit3, Settings, User, PlusCircle, LayoutList } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
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

      const teacherData = await getTeacherByUser(user.user_id);
      if (!teacherData) {
        setError("Teacher profile not found. Please contact an administrator.");
        setLoading(false);
        return;
      }
      setTeacher(teacherData);

      const courses = await getCourses({ teacher: teacherData.id });
      setMyCourses(courses);

      const enrollmentPromises = courses.map((c) =>
        getEnrollments({ course: c.id }).catch(() => [])
      );
      const enrollmentArrays = await Promise.all(enrollmentPromises);
      const allEnrollments = enrollmentArrays.flat();
      const uniqueStudents = new Set(allEnrollments.map((e) => e.student));
      setTotalStudents(uniqueStudents.size);

      const assignmentPromises = courses.map((c) =>
        getAssignments({ course: c.id }).catch(() => [])
      );
      const assignmentArrays = await Promise.all(assignmentPromises);
      const allAssignments = assignmentArrays.flat();

      const submissionPromises = allAssignments.map((a) =>
        getSubmissions({ assignment: a.id }).catch(() => [])
      );
      const submissionArrays = await Promise.all(submissionPromises);
      const allSubmissions = submissionArrays
        .flat()
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 8);
      setPendingSubmissions(allSubmissions);

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
      hour: "2-digit", minute: "2-digit"
    });
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl border border-slate-100 shimmer" />)}
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
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <span className="text-3xl">👨‍🏫</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
              Teacher Hub
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Welcome back, {user?.first_name || user?.username}.
              {teacher?.subject && <span> Subject: <strong className="text-brand-600">{teacher.subject}</strong></span>}
            </p>
          </div>
        </div>
        <Link to="/courses/new" className="btn-primary shrink-0 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
          <PlusCircle className="w-4 h-4" /> Create Course
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Courses Created", value: myCourses.length, icon: BookOpen, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Submissions", value: pendingSubmissions.length, icon: ClipboardList, color: "text-yellow-600", bg: "bg-yellow-50" },
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
        
        {/* Left column (My Courses) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" /> Managed Courses
              </h2>
            </div>

            {myCourses.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No courses yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start sharing your knowledge by creating your first course.</p>
                <Link to="/courses/new" className="btn-primary">Create Course</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map(course => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-full sm:w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-brand-100 relative">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-brand-300" /></div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full min-w-0">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-1">{course.description || "No description provided."}</p>
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2 shrink-0 border-t sm:border-0 border-slate-200 pt-3 sm:pt-0 mt-3 sm:mt-0">
                      <Link
                        to={`/courses/${course.id}/lessons`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
                      >
                        <LayoutList className="w-3.5 h-3.5" /> Lessons
                      </Link>
                      <Link
                        to={`/courses/${course.id}/manage`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm"
                      >
                        <Settings className="w-3.5 h-3.5" /> Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          
          {/* Submissions */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-yellow-500" /> Recent Submissions
              </h2>
            </div>
            
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No submissions to review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map(sub => (
                  <Link
                    key={sub.id}
                    to={`/assignments/${sub.assignment}`}
                    className="block p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 text-sm truncate">Sub #{sub.id}</p>
                      <span className="badge badge-green shrink-0 ml-2">New</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(sub.submitted_at)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-display font-bold text-slate-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link to="/courses/new" className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Create New Course</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
