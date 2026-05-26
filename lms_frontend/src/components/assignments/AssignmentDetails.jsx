import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getAssignmentById } from "../../services/assignmentService";
import { getSubmissions, createSubmission } from "../../services/submissionService";
import { getResults, createResult, updateResult } from "../../services/resultService";
import { getStudentByUser } from "../../services/studentService";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, ClipboardList, Clock, CheckCircle, XCircle, Send, Users, PenTool, Check, Loader2, Award
} from "lucide-react";

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [student, setStudent] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Teacher grading
  const [gradingId, setGradingId] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [gradeResults, setGradeResults] = useState({});
  const [savingGrade, setSavingGrade] = useState(false);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  useEffect(() => { loadData(); }, [id, user]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const assignmentData = await getAssignmentById(id);
      setAssignment(assignmentData);

      if (isStudent) {
        const studentData = await getStudentByUser(user.user_id);
        setStudent(studentData);
        if (studentData) {
          const subs = await getSubmissions({ assignment: id, student: studentData.id });
          const sortedSubs = [...subs].sort((a, b) => b.id - a.id);
          const mySubmissionData = sortedSubs.length > 0 ? sortedSubs[0] : null;
          setMySubmission(mySubmissionData);
          if (mySubmissionData) {
            const resultData = await getResults({ submission: mySubmissionData.id }).catch(() => []);
            const resultsMap = {};
            resultData.forEach((r) => { resultsMap[r.submission] = r; });
            setGradeResults(resultsMap);
          }
        }
      } else if (isTeacher) {
        const allSubs = await getSubmissions({ assignment: id });
        setSubmissions(allSubs);
        const resultPromises = allSubs.map((sub) =>
          getResults({ submission: sub.id }).catch(() => [])
        );
        const resultArrays = await Promise.all(resultPromises);
        const resultsMap = {};
        resultArrays.flat().forEach((r) => { resultsMap[r.submission] = r; });
        setGradeResults(resultsMap);
      }
    } catch (err) {
      setError("Failed to load assignment details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!submissionText.trim()) return;
    try {
      setSubmitting(true);
      await createSubmission({ assignment: parseInt(id), student: student.id, content: submissionText });
      toast.success("Submission successful! Great work! 🎉");
      setSubmissionText("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGrade(submissionId) {
    if (!scoreInput) return;
    try {
      setSavingGrade(true);
      const existing = gradeResults[submissionId];
      if (existing) {
        await updateResult(existing.id, { submission: submissionId, score: parseFloat(scoreInput), feedback: feedbackInput });
      } else {
        await createResult({ submission: submissionId, score: parseFloat(scoreInput), feedback: feedbackInput });
      }
      toast.success("Grade saved successfully!");
      setGradingId(null);
      setScoreInput("");
      setFeedbackInput("");
      await loadData();
    } catch (err) {
      toast.error("Failed to save grade.");
    } finally {
      setSavingGrade(false);
    }
  }

  function isPastDue() {
    return assignment && new Date(assignment.due_date) < new Date();
  }

  if (loading) return (
    <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto space-y-6">
      <div className="w-24 h-6 bg-slate-200 rounded animate-pulse" />
      <div className="h-64 rounded-3xl border border-slate-100 shimmer" />
      <div className="h-48 rounded-3xl border border-slate-100 shimmer" />
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 text-sm font-semibold group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {error && <div className="glass-panel p-4 mb-6 border-red-200 bg-red-50 text-red-600 font-medium">{error}</div>}

      {/* ── Assignment Header ── */}
      <div className="glass-panel p-6 sm:p-8 mb-8 border-t-4 border-t-brand-500">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1 block">Assignment</span>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 leading-tight">
                {assignment?.title}
              </h1>
            </div>
          </div>
          
          <div className="shrink-0">
            {isPastDue() ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                <XCircle className="w-4 h-4" /> Past Due
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Open
              </div>
            )}
          </div>
        </div>

        <div className="prose prose-slate prose-brand max-w-none prose-p:leading-relaxed mb-6">
          <ReactMarkdown>{assignment?.description || "No description provided."}</ReactMarkdown>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl w-fit">
          <Clock className="w-4 h-4 text-brand-500" />
          <span>Due: <span className="text-slate-900">{assignment && new Date(assignment.due_date).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></span>
        </div>
      </div>

      {/* ── STUDENT VIEW ── */}
      {isStudent && (
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2 mb-6">
            {mySubmission ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Send className="w-6 h-6 text-brand-500" />}
            {mySubmission ? "Your Submission" : "Submit Your Work"}
          </h2>

          {mySubmission ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Submitted {new Date(mySubmission.submitted_at).toLocaleString()}
                </p>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {mySubmission.content}
                </div>
              </div>

              {gradeResults[mySubmission.id] && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 shadow-inner">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-brand-500" />
                    <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">Grade Received</p>
                  </div>
                  <div className="text-4xl font-display font-black text-slate-900 mb-4">
                    {gradeResults[mySubmission.id].score}<span className="text-slate-400 text-2xl font-semibold">/100</span>
                  </div>
                  {gradeResults[mySubmission.id].feedback && (
                    <div className="p-4 rounded-xl bg-white/60 border border-white/40">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Feedback</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{gradeResults[mySubmission.id].feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {gradeResults[mySubmission.id] && gradeResults[mySubmission.id].score < 40 && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-2 text-sm font-medium">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>The score is not sufficient to gain the certificate. You need to resubmit the assignment.</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-slate-900">Resubmit Assignment</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Write your new answer here..."
                        rows={8}
                        className="glass-input w-full resize-none font-medium"
                        required
                      />
                      <button type="submit" disabled={submitting || isPastDue()} className="btn-primary w-full h-12 text-base">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isPastDue() ? "Deadline Passed" : "Resubmit Assignment"}
                      </button>
                      {isPastDue() && <p className="text-red-600 text-sm text-center font-medium">The deadline has passed. Resubmissions are no longer accepted.</p>}
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your answer here..."
                rows={8}
                className="glass-input w-full resize-none font-medium"
                required
              />
              <button type="submit" disabled={submitting || isPastDue()} className="btn-primary w-full h-12 text-base">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isPastDue() ? "Deadline Passed" : "Submit Assignment"}
              </button>
              {isPastDue() && <p className="text-red-600 text-sm text-center font-medium">The deadline has passed. Submissions are no longer accepted.</p>}
            </form>
          )}
        </div>
      )}

      {/* ── TEACHER VIEW ── */}
      {isTeacher && (
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-500" /> Student Submissions
            </h2>
            <span className="badge badge-gray">{submissions.length} total</span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => {
                const result = gradeResults[sub.id];
                const isGrading = gradingId === sub.id;
                return (
                  <div key={sub.id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-slate-900 font-bold">{sub.student_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(sub.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      {result ? (
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-sm font-bold">
                          <Award className="w-4 h-4 text-green-500" /> {result.score}/100
                        </div>
                      ) : (
                        <span className="badge badge-yellow text-xs">Ungraded</span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{sub.content}</p>
                    </div>

                    {isGrading ? (
                      <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 space-y-3">
                        <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <PenTool className="w-4 h-4" /> Grading Panel
                        </p>
                        <div className="flex gap-3">
                          <input type="number" min="0" max="100" placeholder="Score (0-100)" value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                            className="glass-input bg-white flex-1 text-sm border-brand-200" />
                        </div>
                        <textarea placeholder="Feedback (optional)" rows={3} value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          className="glass-input bg-white w-full text-sm resize-none border-brand-200" />
                        
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => handleGrade(sub.id)} disabled={savingGrade || !scoreInput} className="btn-primary flex-1 text-sm">
                            {savingGrade ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Check className="w-4 h-4" /> Save Grade</>}
                          </button>
                          <button onClick={() => setGradingId(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button onClick={() => { setGradingId(sub.id); setScoreInput(result?.score || ""); setFeedbackInput(result?.feedback || ""); }}
                          className="btn-secondary text-sm">
                          <PenTool className="w-4 h-4" /> {result ? "Edit Grade" : "Grade Submission"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
