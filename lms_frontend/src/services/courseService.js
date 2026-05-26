import api, { unwrap } from "./api";

export async function createCourse(courseData) {
  const response = await api.post("/course/", courseData);
  return response.data;
}

export async function getCourses(params = {}) {
  const response = await api.get("/course/", { params });
  return unwrap(response.data);
}

export async function getCourseById(courseId) {
  const response = await api.get(`/course/${courseId}/`);
  return response.data;
}

export async function updateCourse(id, data) {
  const response = await api.put(`/course/${id}/`, data);
  return response.data;
}

export async function deleteCourse(id) {
  const response = await api.delete(`/course/${id}/`);
  return response.data;
}

/**
 * Upload a thumbnail image for a course.
 * @param {number} courseId
 * @param {File} file
 * @returns {{ thumbnail_url: string }}
 */
export async function uploadCourseThumbnail(courseId, file) {
  const formData = new FormData();
  formData.append("thumbnail", file);
  const response = await api.post(`/course/${courseId}/thumbnail/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
