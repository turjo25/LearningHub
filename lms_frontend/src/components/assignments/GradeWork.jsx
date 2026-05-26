import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getTeacherByUser } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { getAssignments } from "../../services/assignmentService";
import { getSubmissions } from "../../services/submissionService";
import { getResults } from "../../services/resultService";
import { CheckSquare, Clock, ArrowRight, Award } from "lucide-react";

export default function GradeWork() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'ungraded', 'graded'

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const teacherData = await getTeacherByUser(user.user_id);
      if (!teacherData) return;

      const courses = await getCourses({ teacher: teacherData.id });
      const assignmentPromises = courses.map(c => getAssignments({ course: c.id }).catch(() => []));
      const assignmentArrays = await Promise.all(assignmentPromises);
      const allAssignments = assignmentArrays.flat();

      const submissionPromises = allAssignments.map(a => getSubmissions({ assignment: a.id }).catch(() => []));
      const submissionArrays = await Promise.all(submissionPromises);
      
      const allSubmissions = submissionArrays.flat().sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      // Load all results to see which ones are graded
      const resultPromises = allSubmissions.map(sub => getResults({ submission: sub.id }).catch(() => []));
      const resultArrays = await Promise.all(resultPromises);
      const resultsMap = {};
      resultArrays.flat().forEach(r => { resultsMap[r.submission] = r; });

      setSubmissions(allSubmissions);
      setResults(resultsMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const isGraded = !!results[sub.id];
    if (filter === "ungraded") return !isGraded;
    if (filter === "graded") return isGraded;
    return true;
  });

  const ungradedCount = submissions.filter(s => !results[s.id]).length;

  if (loading) {
    return (
      <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-6">
        <div className="w-48 h-8 rounded-lg shimmer" />
        <div className="flex gap-2">
          <div className="w-24 h-8 rounded-full shimmer" />
          <div className="w-24 h-8 rounded-full shimmer" />
        </div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto page-enter">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900">Grade Work</h1>
            <p className="text-slate-500 font-medium mt-1">
              You have <strong className="text-indigo-600">{ungradedCount}</strong> ungraded submission{ungradedCount !== 1 && "s"} waiting.
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>All</button>
          <button onClick={() => setFilter("ungraded")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === "ungraded" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Ungraded</button>
          <button onClick={() => setFilter("graded")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === "graded" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Graded</button>
        </div>
      </header>

      {submissions.length === 0 ? (
        <div className="text-center py-16 glass-panel">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Submissions Yet</h2>
          <p className="text-slate-500 mb-6">When students complete their assignments, they will appear here.</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-500 font-medium">No submissions match the "{filter}" filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map(sub => {
            const isGraded = !!results[sub.id];
            return (
              <Link
                key={sub.id}
                to={`/assignments/${sub.assignment}`}
                className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sub.student_name}
                    </p>
                    {isGraded ? (
                      <span className="badge badge-green"><Award className="w-3 h-3" /> Graded</span>
                    ) : (
                      <span className="badge badge-yellow">Needs Review</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Submitted: {new Date(sub.submitted_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                  {isGraded && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                      <p className="font-black text-green-600 text-lg">{results[sub.id].score}/100</p>
                    </div>
                  )}
                  <div className="flex-1 sm:flex-none btn-secondary border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:border-indigo-600">
                    {isGraded ? "Edit Grade" : "Grade Now"} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
