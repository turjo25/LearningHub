/**
 * CourseBuilder — full CRUD for courses, lessons, and assignments.
 * Accessible only to teachers. Reached via /courses/:courseId/manage
 * or /courses/new for creating a new course.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import {
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseThumbnail,
} from "../../services/courseService";
import {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../services/lessonService";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/assignmentService";
import { getTeacherByUser } from "../../services/teacherService";
import { getCategories } from "../../services/categoryService";
import toast from "react-hot-toast";

// ─── tiny helpers ────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-900 font-semibold mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onConfirm} className="btn-primary bg-red-600 hover:bg-red-500 text-sm px-6 text-white border-0">
            Delete
          </button>
          <button onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5 font-bold">{label}</label>
      {children}
      {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

// ─── Course form ─────────────────────────────────────────────────────────────

function CourseForm({ initial, teacherId, categories, onSave, onCancel, saving, courseId, onThumbnailUploaded }) {
  const thumbInputRef = useRef(null);
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    level: initial?.level || "beginner",
    category: initial?.category || "",
    price: initial?.price || 0,
  });
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Sync form when `initial` changes (e.g. after course is created and page reloads)
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        level: initial.level || "beginner",
        category: initial.category || "",
        price: initial.price || 0,
      });
    }
  }, [initial?.id]);

  useEffect(() => {
    return () => { if (thumbPreview) URL.revokeObjectURL(thumbPreview); };
  }, [thumbPreview]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function handleThumbChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPEG, PNG, GIF, or WebP allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB."); return; }
    setThumbFile(file);
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbPreview(URL.createObjectURL(file));
  }

  async function handleThumbUpload() {
    if (!thumbFile || !courseId) return;
    try {
      setUploadingThumb(true);
      const result = await uploadCourseThumbnail(courseId, thumbFile);
      onThumbnailUploaded?.(result.thumbnail_url);
      setThumbFile(null);
      setThumbPreview(null);
      toast.success("Thumbnail uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload thumbnail.");
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      level: form.level,
      category: form.category || null,
      teacher: teacherId,
      price: form.price,
    });
  }

  // Current thumbnail to display: local preview > saved thumbnail_url > saved thumbnail path
  const currentThumb = thumbPreview || initial?.thumbnail_url || null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Course Title">
        <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Introduction to Python" className="glass-input bg-gray-50 w-full" required />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
          placeholder="What will students learn? Markdown supported."
          rows={4} className="glass-input bg-gray-50 w-full resize-none" required />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Level">
          <select value={form.level} onChange={(e) => set("level", e.target.value)} className="glass-input bg-gray-50 w-full">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Category (optional)">
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="glass-input bg-gray-50 w-full">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Price ($)">
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className="glass-input bg-gray-50 w-full" required />
        </Field>
      </div>

      {/* Thumbnail upload — only shown when editing an existing course */}
      {courseId && (
        <Field label="Course Thumbnail" hint="JPEG, PNG, GIF, WebP · max 10 MB">
          <div className="space-y-3">
            {/* Preview */}
            {currentThumb && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={currentThumb} alt="Thumbnail preview" className="w-full h-full object-cover" />
                {thumbFile && (
                  <span className="absolute top-2 right-2 text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md">
                    New — not saved yet
                  </span>
                )}
              </div>
            )}

            {/* File picker button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-all"
              >
                🖼 {currentThumb ? "Change Image" : "Choose Image"}
              </button>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleThumbChange}
              />
              {thumbFile && (
                <>
                  <span className="text-xs text-gray-400 truncate max-w-[160px]">{thumbFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setThumbFile(null); setThumbPreview(null); }}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >✕</button>
                  <button
                    type="button"
                    onClick={handleThumbUpload}
                    disabled={uploadingThumb}
                    className="btn-primary text-xs px-4 py-2 disabled:opacity-50 ml-auto"
                  >
                    {uploadingThumb ? "Uploading…" : "Upload"}
                  </button>
                </>
              )}
            </div>
          </div>
        </Field>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving…" : initial ? "Update Course" : "Create Course"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold text-sm transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Lesson form ─────────────────────────────────────────────────────────────

function LessonForm({ initial, courseId, nextOrder, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    video_url: initial?.video_url || "",
    order: initial?.order ?? nextOrder,
  });

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Lesson title is required."); return; }
    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim() || null,
      order: parseInt(form.order, 10) || 0,
      course: courseId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl bg-gray-50 border border-gray-200">
      <Field label="Lesson Title">
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Variables and Data Types"
          className="glass-input bg-white w-full"
          required
        />
      </Field>

      <Field label="Content / Description" hint="Markdown is supported.">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Lesson content, notes, or instructions…"
          rows={4}
          className="glass-input bg-white w-full resize-none"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Video URL (optional)" hint="YouTube, Vimeo, or direct .mp4 link.">
          <input
            type="url"
            value={form.video_url}
            onChange={(e) => set("video_url", e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className="glass-input bg-white w-full"
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => set("order", e.target.value)}
            className="glass-input bg-white w-full"
          />
        </Field>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
          {saving ? "Saving…" : initial ? "Update Lesson" : "Add Lesson"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 font-semibold hover:bg-gray-50 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Assignment form ──────────────────────────────────────────────────────────

function AssignmentForm({ initial, courseId, lessonId, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    due_date: initial?.due_date ? initial.due_date.slice(0, 16) : "",
  });

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.due_date) {
      toast.error("Title and due date are required.");
      return;
    }
    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      due_date: new Date(form.due_date).toISOString(),
      course: courseId,
      lesson: lessonId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-brand-50 border border-brand-200">
      <Field label="Assignment Title">
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Build a calculator"
          className="glass-input bg-white w-full"
          required
        />
      </Field>
      <Field label="Instructions" hint="Markdown supported.">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe what students need to submit…"
          rows={3}
          className="glass-input bg-white w-full resize-none"
        />
      </Field>
      <Field label="Due Date & Time">
        <input
          type="datetime-local"
          value={form.due_date}
          onChange={(e) => set("due_date", e.target.value)}
          className="glass-input bg-white w-full"
          required
        />
      </Field>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
          {saving ? "Saving…" : initial ? "Update Assignment" : "Add Assignment"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Lesson row (with inline assignment management) ───────────────────────────

function LessonRow({ lesson, courseId, onEdit, onDelete, allAssignments, onAssignmentSave, onAssignmentDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, label }

  const lessonAssignments = allAssignments.filter((a) => a.lesson === lesson.id);

  async function handleAssignmentSave(data) {
    setSavingAssignment(true);
    try {
      if (editingAssignment) {
        await onAssignmentSave("update", editingAssignment.id, data);
        setEditingAssignment(null);
      } else {
        await onAssignmentSave("create", null, data);
        setShowAssignForm(false);
      }
    } finally {
      setSavingAssignment(false);
    }
  }

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden">
      {/* Lesson header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-xs font-bold text-brand-600 flex-shrink-0">
            {lesson.order + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold truncate">{lesson.title}</p>
            {lesson.video_url && <p className="text-xs text-brand-500 mt-0.5">▶ Video attached</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100/80 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-full hover:text-gray-900 hover:border-gray-300 transition-all font-semibold"
          >
            {expanded ? "▲ Collapse" : `▼ Manage (${lessonAssignments.length} assignment${lessonAssignments.length !== 1 ? "s" : ""})`}
          </button>
          <button
            onClick={() => onEdit(lesson)}
            className="text-xs text-brand-600 border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-all font-semibold"
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmDelete({ type: "lesson", id: lesson.id, label: lesson.title })}
            className="text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all font-semibold"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded: assignments */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700">Assignments</p>
            {!showAssignForm && !editingAssignment && (
              <button
                onClick={() => setShowAssignForm(true)}
                className="text-xs text-brand-600 border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-all font-semibold"
              >
                + Add Assignment
              </button>
            )}
          </div>

          {showAssignForm && (
            <AssignmentForm
              courseId={courseId}
              lessonId={lesson.id}
              onSave={handleAssignmentSave}
              onCancel={() => setShowAssignForm(false)}
              saving={savingAssignment}
            />
          )}

          {lessonAssignments.length === 0 && !showAssignForm && (
            <p className="text-gray-500 text-sm text-center py-3 font-medium">No assignments yet.</p>
          )}

          {lessonAssignments.map((a) => (
            <div key={a.id}>
              {editingAssignment?.id === a.id ? (
                <AssignmentForm
                  initial={a}
                  courseId={courseId}
                  lessonId={lesson.id}
                  onSave={handleAssignmentSave}
                  onCancel={() => setEditingAssignment(null)}
                  saving={savingAssignment}
                />
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div>
                    <p className="text-gray-900 text-sm font-bold">{a.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 font-medium">
                      Due: {new Date(a.due_date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingAssignment(a)}
                      className="text-xs text-brand-600 border border-brand-200 bg-white px-3 py-1 rounded-full hover:bg-brand-50 transition-all font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ type: "assignment", id: a.id, label: a.title })}
                      className="text-xs text-red-600 border border-red-200 bg-white px-3 py-1 rounded-full hover:bg-red-50 transition-all font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message={`Delete "${confirmDelete.label}"? This cannot be undone.`}
          onConfirm={async () => {
            if (confirmDelete.type === "lesson") await onDelete(lesson.id);
            else await onAssignmentDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Main CourseBuilder page ──────────────────────────────────────────────────

export default function CourseBuilder() {
  const { courseId } = useParams(); // undefined when creating new
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !courseId;

  const [teacher, setTeacher] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); // lesson object or "new"
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);

  // Guard: teachers only
  useEffect(() => {
    if (user && user.role !== "teacher") navigate("/dashboard", { replace: true });
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [teacherData, cats] = await Promise.all([
        getTeacherByUser(user.user_id),
        getCategories(),
      ]);
      setTeacher(teacherData);
      setCategories(cats);

      if (!isNew && courseId) {
        const [c, ls, as] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourse(courseId),
          getAssignments({ course: courseId }),
        ]);
        // Verify this teacher owns the course
        if (c.teacher !== teacherData?.id) {
          toast.error("You don't have permission to edit this course.");
          navigate("/dashboard", { replace: true });
          return;
        }
        setCourse(c);
        setLessons(ls);
        setAssignments(as);
      }
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => { if (user) loadData(); }, [loadData, user]);

  // ── Course CRUD ──

  async function handleCourseSave(data) {
    setSaving(true);
    try {
      if (isNew) {
        const created = await createCourse(data);
        toast.success("Course created! You can now upload a thumbnail.");
        navigate(`/courses/${created.id}/manage`, { replace: true });
      } else {
        const updated = await updateCourse(courseId, data);
        setCourse(updated);
        toast.success("Course updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCourseDelete() {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted.");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Failed to delete course.");
    }
  }

  // ── Lesson CRUD ──

  async function handleLessonSave(data) {
    setSaving(true);
    try {
      if (editingLesson === "new") {
        const created = await createLesson(data);
        setLessons((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        toast.success("Lesson added!");
      } else {
        const updated = await updateLesson(editingLesson.id, data);
        setLessons((prev) => prev.map((l) => l.id === updated.id ? updated : l).sort((a, b) => a.order - b.order));
        toast.success("Lesson updated!");
      }
      setEditingLesson(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLessonDelete(lessonId) {
    try {
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      setAssignments((prev) => prev.filter((a) => a.lesson !== lessonId));
      toast.success("Lesson deleted.");
    } catch {
      toast.error("Failed to delete lesson.");
    }
  }

  // ── Assignment CRUD ──

  async function handleAssignmentSave(action, assignmentId, data) {
    if (action === "create") {
      const created = await createAssignment(data);
      setAssignments((prev) => [...prev, created]);
      toast.success("Assignment added!");
    } else {
      const updated = await updateAssignment(assignmentId, data);
      setAssignments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      toast.success("Assignment updated!");
    }
  }

  async function handleAssignmentDelete(assignmentId) {
    try {
      await deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      toast.success("Assignment deleted.");
    } catch {
      toast.error("Failed to delete assignment.");
    }
  }

  // ── Render ──

  if (loading) return (
    <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-panel p-6 h-24 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto bg-[#f8f7ff]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(isNew ? "/dashboard" : `/courses/${courseId}`)}
          className="text-gray-500 hover:text-gray-900 font-semibold transition-colors text-sm">
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {isNew ? "Create New Course" : `Edit: ${course?.title}`}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">
            {isNew ? "Fill in the details below to publish your course." : "Update course details, lessons, and assignments."}
          </p>
        </div>
        {!isNew && (
          <button
            onClick={() => setConfirmDeleteCourse(true)}
            className="text-sm text-red-600 border border-red-200 bg-white px-4 py-2 rounded-xl hover:bg-red-50 transition-all font-semibold"
          >
            🗑 Delete Course
          </button>
        )}
      </div>

      {/* ── Course Details ── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span>📚</span> Course Details
        </h2>
        <CourseForm
          initial={course}
          teacherId={teacher?.id}
          categories={categories}
          onSave={handleCourseSave}
          saving={saving}
          courseId={isNew ? null : parseInt(courseId)}
          onThumbnailUploaded={(url) => setCourse((prev) => ({ ...prev, thumbnail_url: url }))}
        />
      </section>

      {/* ── Lessons (only shown after course exists) ── */}
      {!isNew && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
              <span>🎬</span> Lessons
              <span className="text-sm text-gray-500 font-normal">({lessons.length})</span>
            </h2>
            {editingLesson !== "new" && (
              <button
                onClick={() => setEditingLesson("new")}
                className="btn-primary text-sm"
              >
                + Add Lesson
              </button>
            )}
          </div>

          {editingLesson === "new" && (
            <div className="mb-4">
              <LessonForm
                courseId={parseInt(courseId)}
                nextOrder={lessons.length}
                onSave={handleLessonSave}
                onCancel={() => setEditingLesson(null)}
                saving={saving}
              />
            </div>
          )}

          {lessons.length === 0 && editingLesson !== "new" ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-gray-500 font-medium mb-4">No lessons yet. Add your first lesson to get started.</p>
              <button onClick={() => setEditingLesson("new")} className="btn-primary text-sm">
                + Add First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                editingLesson?.id === lesson.id ? (
                  <LessonForm
                    key={lesson.id}
                    initial={lesson}
                    courseId={parseInt(courseId)}
                    nextOrder={lesson.order}
                    onSave={handleLessonSave}
                    onCancel={() => setEditingLesson(null)}
                    saving={saving}
                  />
                ) : (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    courseId={parseInt(courseId)}
                    onEdit={(l) => setEditingLesson(l)}
                    onDelete={handleLessonDelete}
                    allAssignments={assignments}
                    onAssignmentSave={handleAssignmentSave}
                    onAssignmentDelete={handleAssignmentDelete}
                  />
                )
              ))}
            </div>
          )}
        </section>
      )}

      {/* Preview link */}
      {!isNew && (
        <div className="mt-6 text-center">
          <Link
            to={`/courses/${courseId}`}
            className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
          >
            View public course page →
          </Link>
        </div>
      )}

      {confirmDeleteCourse && (
        <ConfirmModal
          message={`Delete "${course?.title}"? All lessons and assignments will be permanently removed.`}
          onConfirm={handleCourseDelete}
          onCancel={() => setConfirmDeleteCourse(false)}
        />
      )}
    </div>
  );
}
