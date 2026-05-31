import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getCourseById } from "../../services/courseService";
import { getLessonsByCourse } from "../../services/lessonService";
import { getAssignmentsByCourse } from "../../services/assignmentService";
import { getStudentByUser } from "../../services/studentService";
import { getProgress, markLessonComplete, markLessonIncomplete } from "../../services/progressService";
import { getSubmissions } from "../../services/submissionService";
import { getResults } from "../../services/resultService";
import { API_URL } from "../../services/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

// Strip the /api suffix to get the media root
const MEDIA_BASE = API_URL.replace(/\/api$/, "");

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return url;
  return null;
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Progress tracking state
  const [student, setStudent] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // { lessonId: progressRecord }
  const [markingProgress, setMarkingProgress] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState({ allGraded: false, passed: false });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData, assignmentsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
        getAssignmentsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setAssignments(assignmentsData);
      if (lessonId) {
        setCurrentLesson(lessonsData.find((l) => l.id === parseInt(lessonId)) || lessonsData[0] || null);
      } else {
        setCurrentLesson(lessonsData[0] || null);
      }

      // Load progress if user is a student
      if (user && user.role === "student") {
        const studentData = await getStudentByUser(user.user_id);
        if (studentData) {
          setStudent(studentData);
          const progressData = await getProgress({ student: studentData.id, course: courseId });
          const map = {};
          progressData.forEach((p) => { map[p.lesson] = p; });
          setProgressMap(map);

          // Check assignments for certificate status
          const [submissionsData, resultsData] = await Promise.all([
            getSubmissions({ student: studentData.id }).catch(() => []),
            getResults().catch(() => [])
          ]);
          
          let allGraded = true;
          let passed = true;
          let failedAssignmentId = null;
          
          if (assignmentsData.length > 0) {
            for (const assignment of assignmentsData) {
              const sub = submissionsData.find(s => s.assignment === assignment.id);
              if (!sub) { allGraded = false; break; }
              const res = resultsData.find(r => r.submission === sub.id);
              if (!res) { allGraded = false; break; }
              if (res.score < 40) {
                passed = false;
                if (!failedAssignmentId) {
                  failedAssignmentId = assignment.id;
                }
              }
            }
          } else {
            allGraded = true;
            passed = true;
          }
          
          setCertificateStatus({ allGraded, passed, failedAssignmentId });
        }
      }
    } catch (err) {
      setError("Failed to load lesson content.");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, user]);

  useEffect(() => { loadData(); }, [loadData]);

  function selectLesson(lesson) {
    setCurrentLesson(lesson);
    navigate(`/courses/${courseId}/lessons/${lesson.id}`, { replace: true });
  }

  async function handleToggleComplete() {
    if (!student || !currentLesson) return;
    setMarkingProgress(true);
    try {
      const isCompleted = progressMap[currentLesson.id]?.completed;
      let updated;
      if (isCompleted) {
        updated = await markLessonIncomplete(student.id, currentLesson.id);
      } else {
        updated = await markLessonComplete(student.id, currentLesson.id);
      }
      setProgressMap((prev) => ({
        ...prev,
        [currentLesson.id]: updated || { ...prev[currentLesson.id], completed: !isCompleted },
      }));
    } catch (err) {
      toast.error("Failed to update progress");
      console.error("Failed to update progress", err);
    } finally {
      setMarkingProgress(false);
    }
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const lessonAssignments = assignments.filter((a) => a.lesson === currentLesson?.id);
  const isCurrentCompleted = progressMap[currentLesson?.id]?.completed;

  if (loading) return (
    <div className="min-h-screen py-6 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-72 flex-shrink-0">
        <div className="glass-panel p-4 h-[60vh] animate-pulse">
          <div className="h-4 w-3/4 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-white/5 rounded"></div>)}
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 space-y-6">
        <div className="glass-panel w-full aspect-video bg-white/5 animate-pulse rounded-2xl"></div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-8 w-1/2 bg-white/10 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded"></div>
            <div className="h-4 bg-white/5 rounded"></div>
            <div className="h-4 w-5/6 bg-white/5 rounded"></div>
          </div>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] py-6 px-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
        <Link to="/courses" className="hover:text-gray-900 transition-colors">Courses</Link>
        <span>/</span>
        <Link to={`/courses/${courseId}`} className="hover:text-gray-900 transition-colors truncate max-w-[180px]">{course?.title}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[180px] font-bold">{currentLesson?.title || "Lessons"}</span>
      </nav>

      <div className="flex flex-col-reverse lg:flex-row gap-6">
        {/* ── Sidebar ── */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{course?.title}</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-semibold">{lessons.length} Lessons</p>
              {user?.role === 'teacher' && (
                <Link to={`/courses/${courseId}/manage`} className="text-xs text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded border border-brand-200 transition-colors font-bold">
                  + Add Lesson
                </Link>
              )}
            </div>

            {/* Progress bar (students only) */}
            {student && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{completedCount}/{lessons.length} completed</span>
                  <span className="text-brand-400 font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 font-medium">No lessons yet.</p>
              ) : lessons.map((lesson, index) => {
                const isCompleted = progressMap[lesson.id]?.completed;
                return (
                  <button key={lesson.id} onClick={() => selectLesson(lesson)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                      currentLesson?.id === lesson.id
                        ? "bg-brand-50 border border-brand-200 text-brand-700"
                        : "bg-transparent border border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}>
                    {/* Lesson number / check */}
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? "bg-green-100 text-green-600 border border-green-200"
                        : currentLesson?.id === lesson.id
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isCompleted ? "line-through text-gray-400" : ""}`}>{lesson.title}</p>
                      {lesson.video_url && <p className="text-xs text-brand-600 mt-0.5 font-medium">▶ Video</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 space-y-6">
          {!currentLesson ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Lessons Available</h2>
              <p className="text-gray-500">This course doesn't have any lessons yet.</p>
            </div>
          ) : (
            <>
              {/* Video */}
              {currentLesson.video_url && (() => {
                const embedUrl = getEmbedUrl(currentLesson.video_url);
                if (!embedUrl) return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔗</span>
                      <p className="text-gray-900 font-bold">External Video</p>
                    </div>
                    <a href={currentLesson.video_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">Open →</a>
                  </div>
                );
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {currentLesson.video_url.match(/\.(mp4|webm|ogg)/i)
                      ? <video key={currentLesson.id} src={embedUrl} controls className="w-full aspect-video bg-black" />
                      : <iframe key={currentLesson.id} src={embedUrl} className="w-full aspect-video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    }
                  </div>
                );
              })()}

              {/* Lesson Info + Mark Complete */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-bold">Lesson {currentIndex + 1} of {lessons.length}</span>
                  {/* Mark as Complete button — only for students */}
                  {student && (
                    <button
                      onClick={handleToggleComplete}
                      disabled={markingProgress || (lessons.length > 0 && completedCount === lessons.length)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                        isCurrentCompleted
                          ? "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/10"
                          : "bg-brand-500/20 border-brand-500/40 text-brand-300 hover:bg-brand-500/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {markingProgress ? (
                        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <span>{isCurrentCompleted ? "✓" : "○"}</span>
                      )}
                      {isCurrentCompleted ? "Completed" : "Mark as Complete"}
                    </button>
                  )}
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 mt-2 mb-3">{currentLesson.title}</h1>
                <div className="text-gray-600 leading-relaxed max-w-none prose prose-p:mb-4 prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 mt-4">
                  <ReactMarkdown>{currentLesson.description}</ReactMarkdown>
                </div>
                {currentLesson.attachment && (
                  <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📎</span>
                      <div>
                        <p className="text-gray-900 font-bold">Lesson Attachment</p>
                        <p className="text-gray-500 text-sm">Downloadable resource</p>
                      </div>
                    </div>
                    <a href={`${MEDIA_BASE}${currentLesson.attachment}`} download className="btn-primary text-sm">Download</a>
                  </div>
                )}
              </div>

              {/* Assignments */}
              {lessonAssignments.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <span>📝</span> Assignments
                  </h2>
                  <div className="space-y-3">
                    {lessonAssignments.map((a) => (
                      <Link key={a.id} to={`/assignments/${a.id}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all group">
                        <div>
                          <p className="text-gray-900 font-bold group-hover:text-brand-700 transition-colors">{a.title}</p>
                          <p className="text-gray-500 text-sm">Due: {new Date(a.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                        <span className="text-brand-600 font-bold text-sm">View →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion banner + certificate link */}
              {student && progressPercent === 100 && (
                <div className="glass-panel p-5 border text-center mt-6">
                  {assignments.length > 0 && !certificateStatus.allGraded ? (
                    <div className="border-amber-500/30 bg-amber-500/5 p-4 rounded-xl">
                      <p className="text-amber-600 font-bold text-lg mb-1">⏳ Waiting for Grades</p>
                      <p className="text-gray-500 text-sm">You have completed all lessons, but your assignments are still pending review by the instructor.</p>
                    </div>
                  ) : !certificateStatus.passed ? (
                    <div className="border-red-500/30 bg-red-500/5 p-4 rounded-xl space-y-3">
                      <p className="text-red-500 font-bold text-lg mb-1">❌ Score Too Low</p>
                      <p className="text-gray-500 text-sm">You scored less than 40 on one or more assignments. Please review and resubmit your work to earn the certificate.</p>
                      {certificateStatus.failedAssignmentId && (
                        <Link to={`/assignments/${certificateStatus.failedAssignmentId}`} className="inline-flex items-center justify-center gap-2 text-white font-semibold py-2 px-5 rounded-full text-sm transition-all duration-200 bg-red-600 hover:bg-red-750 shadow-md hover:-translate-y-0.5 mt-2">
                          Resubmit Assignment
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="border-green-500/30 bg-green-500/5 p-4 rounded-xl">
                      <p className="text-green-500 font-bold text-lg mb-1">🎉 Course Complete!</p>
                      <p className="text-gray-500 text-sm mb-3">You've completed all lessons and passed your assignments.</p>
                      <Link to={`/courses/${courseId}/certificate`} className="btn-primary text-sm inline-block">
                        🎓 View Certificate
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button onClick={() => prevLesson && selectLesson(prevLesson)} disabled={!prevLesson}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  ← Previous
                </button>
                <span className="text-gray-500 text-sm font-bold">{currentIndex + 1} / {lessons.length}</span>
                <button onClick={() => nextLesson && selectLesson(nextLesson)} disabled={!nextLesson}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  Next →
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
