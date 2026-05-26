import api, { unwrap } from "./api";

export async function getProgress(params = {}) {
  const res = await api.get("/lesson-progress/", { params });
  return unwrap(res.data);
}

export async function createProgress(data) {
  const res = await api.post("/lesson-progress/", data);
  return res.data;
}

export async function updateProgress(id, data) {
  const res = await api.patch(`/lesson-progress/${id}/`, data);
  return res.data;
}

export async function markLessonComplete(studentId, lessonId) {
  const existing = await getProgress({ student: studentId, lesson: lessonId });
  if (existing.length > 0) {
    return updateProgress(existing[0].id, { completed: true });
  }
  return createProgress({ student: studentId, lesson: lessonId, completed: true });
}

export async function markLessonIncomplete(studentId, lessonId) {
  const existing = await getProgress({ student: studentId, lesson: lessonId });
  if (existing.length > 0) {
    return updateProgress(existing[0].id, { completed: false });
  }
  return null;
}
