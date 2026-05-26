import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { getStudentByUser } from "../../services/studentService";
import { getEnrollments } from "../../services/enrollmentService";
import { getCourseById } from "../../services/courseService";
import { getAssignments } from "../../services/assignmentService";
import { getSubmissions } from "../../services/submissionService";
import { ClipboardList, Calendar, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MyAssignments() {
  const { user } = useAuth();
  const [coursesWithAssignments, setCoursesWithAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const studentData = await getStudentByUser(user.user_id);
      if (!studentData) return;

      const [enrollmentData, submissionsData] = await Promise.all([
        getEnrollments({ student: studentData.id }),
        getSubmissions({ student: studentData.id })
      ]);
      
      const enrolledCourseIds = enrollmentData.map((e) => e.course);
      const submittedAssignmentIds = new Set(submissionsData.map(s => s.assignment));
      
      const courses = await Promise.all(
        enrolledCourseIds.map((id) => getCourseById(id).catch(() => null))
      );
      const validCourses = courses.filter(Boolean);

      const coursesData = await Promise.all(
        validCourses.map(async (course) => {
          const assignments = await getAssignments({ course: course.id }).catch(() => []);
          
          const assignmentsWithStatus = assignments.map(assignment => ({
            ...assignment,
            submitted: submittedAssignmentIds.has(assignment.id),
            isOverdue: new Date(assignment.due_date) < new Date() && !submittedAssignmentIds.has(assignment.id)
          }));

          return { ...course, assignments: assignmentsWithStatus };
        })
      );
      setCoursesWithAssignments(coursesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
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
          <ClipboardList className="w-8 h-8 text-brand-600" />
          My Assignments
        </h1>
        <p className="text-slate-500">All assignments across your enrolled courses.</p>
      </div>

      {coursesWithAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Assignments Found</h2>
          <p className="text-slate-500">You aren't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {coursesWithAssignments.map(course => (
            <div key={course.id} className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">{course.title}</h2>
              </div>
              <div className="p-2 sm:p-6 grid gap-3">
                {course.assignments.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4 text-center">No assignments in this course yet.</p>
                ) : (
                  course.assignments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).map(assignment => (
                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border transition-all duration-200 group ${
                        assignment.isOverdue ? 'border-red-100 bg-red-50/30' : 'border-transparent hover:border-slate-100'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                          {assignment.title}
                          {assignment.submitted && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{assignment.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                          assignment.submitted 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : assignment.isOverdue
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {assignment.submitted ? 'Submitted' : assignment.isOverdue ? `Overdue: ${formatDate(assignment.due_date)}` : `Due: ${formatDate(assignment.due_date)}`}
                        </div>
                        <div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          &rarr;
                        </div>
                      </div>
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
