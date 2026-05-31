import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getCourseById } from "../../services/courseService";
import { getTeacherDetails } from "../../services/teacherService";
import { createEnrollment, getEnrollments, deleteEnrollment } from "../../services/enrollmentService";
import { getStudentByUser } from "../../services/studentService";
import { getReviews, createReview } from "../../services/reviewService";
import { getLessonsByCourse } from "../../services/lessonService";
import { getProgress } from "../../services/progressService";
import { getAssignments } from "../../services/assignmentService";
import { getSubmissions } from "../../services/submissionService";
import { getResults } from "../../services/resultService";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Star, Edit3, BookOpen, User, PlayCircle, LogOut, Loader2,
  CheckCircle, MessageSquare, GraduationCap
} from "lucide-react";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform duration-200 ${
            star <= (hovered || value) ? "text-yellow-400 scale-110" : "text-slate-200 hover:scale-110"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-base ${s <= Math.round(rating) ? "text-yellow-400" : "text-slate-200"}`}>★</span>
      ))}
    </div>
  );
}

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // Student + enrollment state
  const [student, setStudent] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [unenrolling, setUnenrolling] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Progress
  const [lessonProgress, setLessonProgress] = useState({ completed: 0, total: 0 });
  const [certificateStatus, setCertificateStatus] = useState({ allGraded: false, passed: false });

  useEffect(() => {
    if (id) loadAll();
  }, [id, user]);

  async function loadAll() {
    try {
      setError("");
      setIsLoading(true);

      const c = await getCourseById(id);
      if (!c) { setError("Course not found"); setIsLoading(false); return; }
      setCourse(c);

      if (c.teacher) {
        const teacherData = await getTeacherDetails(c.teacher);
        setTeacher(teacherData);
      }

      const reviewData = await getReviews({ course: id });
      setReviews(reviewData);

      if (user && user.role === "student") {
        const studentData = await getStudentByUser(user.user_id);
        if (studentData) {
          setStudent(studentData);
          const enrollments = await getEnrollments({ student: studentData.id, course: id });
          const myEnrollment = enrollments.find((e) => e.course === parseInt(id));
          const enrolled = !!myEnrollment;
          setIsEnrolled(enrolled);
          setEnrollmentId(myEnrollment?.id || null);

          const myReview = reviewData.find((r) => r.student === studentData.id);
          setHasReviewed(!!myReview);

          if (enrolled) {
            const [lessons, progress, assignments, submissions, allResults] = await Promise.all([
              getLessonsByCourse(id),
              getProgress({ student: studentData.id, course: id }),
              getAssignments({ course: id }).catch(() => []),
              getSubmissions({ student: studentData.id }).catch(() => []),
              getResults().catch(() => [])
            ]);
            setLessonProgress({
              completed: progress.filter((p) => p.completed).length,
              total: lessons.length,
            });

            let allGraded = true;
            let passed = true;
            if (assignments.length > 0) {
              for (const assignment of assignments) {
                const sub = submissions.find(s => s.assignment === assignment.id);
                if (!sub) { allGraded = false; break; }
                const res = allResults.find(r => r.submission === sub.id);
                if (!res) { allGraded = false; break; }
                if (res.score < 40) { passed = false; }
              }
            } else {
              allGraded = true;
              passed = true;
            }
            setCertificateStatus({ allGraded, passed });
          }
        }
      }
    } catch (err) {
      setError("Failed to load course details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnroll() {
    if (!student) {
      toast.error("Student profile not found. Please contact support.");
      return;
    }
    try {
      setEnrolling(true);
      const enrollment = await createEnrollment({ student: student.id, course: course.id });
      toast.success("Successfully enrolled! 🎉");
      setIsEnrolled(true);
      setEnrollmentId(enrollment.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleUnenroll() {
    if (!enrollmentId) return;
    try {
      setUnenrolling(true);
      await deleteEnrollment(enrollmentId);
      toast.success("You have unenrolled from this course.");
      setIsEnrolled(false);
      setEnrollmentId(null);
      setLessonProgress({ completed: 0, total: 0 });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to unenroll.");
    } finally {
      setUnenrolling(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!reviewRating) { toast.error("Please select a rating."); return; }
    try {
      setSubmittingReview(true);
      const newReview = await createReview({
        student: student.id,
        course: parseInt(id),
        rating: reviewRating,
        review: reviewText,
      });
      setReviews((prev) => [newReview, ...prev]);
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewText("");
      toast.success("Review submitted successfully! ⭐");
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const progressPct = lessonProgress.total > 0
    ? Math.round((lessonProgress.completed / lessonProgress.total) * 100)
    : 0;

  if (isLoading) return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-6">
      <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
      <div className="h-64 rounded-3xl border border-slate-100 shimmer" />
      <div className="space-y-4 max-w-3xl">
        <div className="h-12 rounded-xl shimmer w-3/4" />
        <div className="h-4 rounded-full shimmer w-full" />
        <div className="h-4 rounded-full shimmer w-5/6" />
      </div>
    </div>
  );

  if (error && !course) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 text-center max-w-md w-full">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-red-600 mb-6 font-medium">{error}</p>
        <button onClick={() => navigate("/courses")} className="btn-primary w-full">Back to Courses</button>
      </div>
    </div>
  );

  const renderActionCard = (isMobile) => (
    <div className={`glass-panel p-6 border-brand-100 shadow-[0_8px_30px_rgba(99,102,241,0.08)] ${isMobile ? "lg:hidden mb-6" : "hidden lg:block"}`}>
      <div className="text-center mb-6">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Enrollment</p>
        <div className="text-4xl font-display font-black text-slate-900">
          {course?.price === undefined || parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
        </div>
      </div>

      {isEnrolled && lessonProgress.total > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Progress</span>
            <span className={`text-xs font-black ${progressPct === 100 ? "text-green-600" : "text-brand-600"}`}>
              {progressPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPct === 100 ? "bg-green-500" : "bg-brand-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] font-medium text-slate-500 text-center">{lessonProgress.completed} of {lessonProgress.total} lessons done</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isEnrolled ? (
          <>
            <Link to={`/courses/${id}/lessons`} className="btn-primary w-full shadow-brand-200">
              <PlayCircle className="w-5 h-5" /> Continue Learning
            </Link>
            
            {progressPct === 100 && certificateStatus.allGraded && certificateStatus.passed && (
              <Link to={`/courses/${id}/certificate`} className="btn-secondary w-full bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600">
                <GraduationCap className="w-5 h-5" /> View Certificate
              </Link>
            )}
            {progressPct === 100 && !certificateStatus.allGraded && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                 <p className="text-xs font-bold text-amber-700">⏳ Waiting for Grades</p>
              </div>
            )}
            {progressPct === 100 && certificateStatus.allGraded && !certificateStatus.passed && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                 <p className="text-xs font-bold text-red-600">❌ Score too low for certificate</p>
              </div>
            )}
            
            {!hasReviewed && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-secondary w-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500">
                <Star className="w-4 h-4" /> Rate Course
              </button>
            )}
            
            <button onClick={handleUnenroll} disabled={unenrolling} className="mt-2 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 w-full py-2">
              {unenrolling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />} 
              Unenroll
            </button>
          </>
        ) : (
          <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full h-12 text-base">
            {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enroll Now"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 max-w-5xl mx-auto page-enter px-4">
      
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors text-sm font-semibold group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
        </button>
        {user?.role === "teacher" && course && (
          <Link
            to={`/courses/${id}/manage`}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 border border-brand-200 px-4 py-2 rounded-xl hover:bg-brand-50 hover:shadow-sm transition-all"
          >
            <Edit3 className="w-4 h-4" /> Edit Course
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
          {error}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col (Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero section */}
          <div className="glass-panel overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="relative h-64 bg-slate-100 flex items-center justify-center">
              {course?.thumbnail_url || course?.thumbnail
                ? <img src={course.thumbnail_url || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                : <BookOpen className="w-16 h-16 text-slate-300" />
              }
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                {course?.level && <span className="badge badge-gray bg-white/10 backdrop-blur text-white border-white/20 capitalize">{course.level}</span>}
                {course?.category_name && <span className="badge badge-brand bg-brand-500 text-white border-brand-400">{course.category_name}</span>}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">{course?.title}</h1>
              
              {/* Rating */}
              {avgRating && (
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-display font-bold text-amber-500">{avgRating}</span>
                    <StarDisplay rating={parseFloat(avgRating)} />
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <span className="text-slate-500 text-sm font-medium">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Dynamic Action Card on mobile */}
              {renderActionCard(true)}

              <div className="prose prose-slate prose-brand max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{course?.description || "No description provided."}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-500" /> Reviews
              </h2>
            </div>

            {/* Review form */}
            {showReviewForm && isEnrolled && !hasReviewed && (
              <div className="mb-8 p-6 rounded-2xl bg-amber-50 border border-amber-100 shadow-inner">
                <h3 className="text-lg font-bold text-amber-900 mb-4">Share your experience</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-amber-900/60 mb-2 block">Rating</label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-amber-900/60 mb-2 block">Review Details (Optional)</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you like about this course?"
                      rows={3}
                      className="glass-input bg-white w-full resize-none text-sm border-amber-200 focus:border-amber-400 focus:ring-amber-400/40"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={submittingReview || !reviewRating} className="btn-primary shadow-amber-200 hover:shadow-amber-300 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No reviews yet. Be the first to rate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl border border-slate-100 hover:border-brand-200 transition-colors bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          {review.student_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-sm">{review.student_name}</p>
                          <p className="text-slate-400 text-[11px] font-medium">
                            {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                    {review.review && (
                      <div className="text-slate-600 text-sm leading-relaxed mt-2 prose prose-sm">
                        <ReactMarkdown>{review.review}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col (Sidebar) */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
          
          {/* Action Card */}
          {renderActionCard(false)}

          {/* Instructor Card */}
          <div className="glass-panel p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Instructor
            </h2>
            {teacher ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200">
                  👨‍🏫
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight mb-0.5">{teacher.name}</p>
                  <p className="text-xs font-semibold text-brand-600 mb-1">{teacher.subject}</p>
                  {teacher.email && <p className="text-xs text-slate-500 truncate w-40">{teacher.email}</p>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">No instructor assigned.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
