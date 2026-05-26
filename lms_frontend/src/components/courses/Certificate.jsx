import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getCourseById } from "../../services/courseService";
import { getStudentByUser } from "../../services/studentService";
import { getLessonsByCourse } from "../../services/lessonService";
import { getProgress } from "../../services/progressService";
import { getAssignments } from "../../services/assignmentService";
import { getSubmissions } from "../../services/submissionService";
import { getResults } from "../../services/resultService";

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) loadCertificate();
  }, [user, courseId]);

  async function loadCertificate() {
    try {
      setLoading(true);
      setError("");

      // Require student role
      if (user.role !== "student") {
        navigate(`/courses/${courseId}`, { replace: true });
        return;
      }

      const [courseData, studentData] = await Promise.all([
        getCourseById(courseId),
        getStudentByUser(user.user_id),
      ]);

      if (!courseData) {
        navigate("/courses", { replace: true });
        return;
      }
      if (!studentData) {
        setError("Student profile not found.");
        setLoading(false);
        return;
      }

      setCourse(courseData);
      setStudent(studentData);

      // Verify 100% completion
      const [lessons, progress, assignments, submissions, allResults] = await Promise.all([
        getLessonsByCourse(courseId),
        getProgress({ student: studentData.id, course: courseId }),
        getAssignments({ course: courseId }).catch(() => []),
        getSubmissions({ student: studentData.id }).catch(() => []),
        getResults().catch(() => [])
      ]);

      const total = lessons.length;
      const completed = progress.filter((p) => p.completed).length;

      if (total === 0 || completed < total) {
        // Not fully complete — redirect back to course
        navigate(`/courses/${courseId}`, { replace: true });
        return;
      }

      // Verify all assignments are graded
      let allGraded = true;
      if (assignments.length > 0) {
        for (const assignment of assignments) {
          const sub = submissions.find(s => s.assignment === assignment.id);
          if (!sub) {
            allGraded = false;
            break;
          }
          const res = allResults.find(r => r.submission === sub.id);
          if (!res) {
            allGraded = false;
            break;
          }
        }
      }

      if (!allGraded) {
        // Assignments not graded — redirect back to course
        navigate(`/courses/${courseId}`, { replace: true });
        return;
      }

      // Use the most recent completion date from progress records
      const dates = progress
        .filter((p) => p.completed && p.completed_at)
        .map((p) => new Date(p.completed_at));
      const latest = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
      setCompletedAt(latest);
    } catch (err) {
      setError("Failed to load certificate.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const studentName =
    student
      ? [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Student"
      : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center">
        <div className="card p-12 text-center animate-pulse">
          <div className="text-5xl mb-4">🎓</div>
          <div className="h-6 w-48 bg-gray-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles — hides everything except the certificate */}
      <style>{`
        @media print {
          body > *:not(#certificate-root) { display: none !important; }
          #certificate-root { display: block !important; }
          #certificate-root .no-print { display: none !important; }
        }
      `}</style>

      <div id="certificate-root" className="min-h-screen bg-[#f8f7ff] py-10 px-4 flex flex-col items-center justify-center">
        {/* Action buttons — hidden on print */}
        <div className="no-print flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e8e6ff] bg-white hover:bg-gray-50 text-gray-700 transition-all text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Certificate Card */}
        <div className="w-full max-w-2xl">
          {/* Gradient border wrapper */}
          <div className="p-[2px] rounded-3xl bg-linear-to-br from-yellow-400 via-brand-500 to-accent-500 shadow-2xl shadow-brand-500/20">
            <div className="rounded-3xl bg-[#0f1117] px-10 py-12 text-center relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/5 blur-[80px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[80px]"></div>
              </div>

              {/* Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-yellow-400 text-2xl">⭐</span>
                  <span className="text-yellow-400 text-2xl">⭐</span>
                  <span className="text-yellow-400 text-2xl">⭐</span>
                </div>
                <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-1">
                  Learning Hub
                </p>
                <h2 className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase mb-6">
                  Certificate of Completion
                </h2>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent"></div>
                  <span className="text-yellow-400 text-xl">🎓</span>
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent"></div>
                </div>

                {/* Congratulations */}
                <p className="text-gray-400 text-sm mb-3">This certifies that</p>
                <h1 className="text-4xl font-display font-bold text-white mb-3 tracking-wide">
                  {studentName}
                </h1>
                <p className="text-gray-400 text-sm mb-5">has successfully completed the course</p>

                {/* Course Title */}
                <div className="inline-block px-6 py-3 rounded-2xl bg-linear-to-r from-brand-600/30 to-accent-600/30 border border-brand-500/30 mb-6">
                  <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-300 to-accent-300">
                    {course?.title}
                  </h3>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                </div>

                {/* Completion date */}
                <p className="text-gray-500 text-sm">
                  Completed on{" "}
                  <span className="text-gray-300 font-semibold">{formatDate(completedAt)}</span>
                </p>

                {/* Footer stars */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <span className="text-yellow-400/60 text-lg">★</span>
                  <span className="text-yellow-400/80 text-xl">★</span>
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="text-yellow-400/80 text-xl">★</span>
                  <span className="text-yellow-400/60 text-lg">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
