import api, { unwrap } from "./api";

export async function getTeachers(params = {}) {
  const response = await api.get("/teacher/", { params });
  return unwrap(response.data);
}

export async function getTeacherDetails(id) {
  const response = await api.get(`/teacher/${id}/`);
  return response.data;
}

export async function getTeacherByUser(userId) {
  const response = await api.get("/teacher/", { params: { user: userId } });
  const data = unwrap(response.data);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function createTeacher(teacherData) {
  const response = await api.post("/teacher/", teacherData);
  return response.data;
}

export async function updateTeacher(id, data) {
  const response = await api.patch(`/teacher/${id}/`, data);
  return response.data;
}
