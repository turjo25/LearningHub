import api, { unwrap } from "./api";

export async function getLessons(params = {}) {
  const response = await api.get("/lesson/", { params });
  return unwrap(response.data);
}

export async function getLessonById(id) {
  const response = await api.get(`/lesson/${id}/`);
  return response.data;
}

export async function getLessonsByCourse(courseId) {
  return getLessons({ course: courseId });
}

export async function createLesson(lessonData) {
  const response = await api.post("/lesson/", lessonData);
  return response.data;
}

export async function updateLesson(id, lessonData) {
  const response = await api.put(`/lesson/${id}/`, lessonData);
  return response.data;
}

export async function deleteLesson(id) {
  const response = await api.delete(`/lesson/${id}/`);
  return response.data;
}
