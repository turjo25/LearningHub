import api, { unwrap } from "./api";

export async function getStudents(params = {}) {
  const response = await api.get("/student/", { params });
  return unwrap(response.data);
}

export async function getStudentById(id) {
  const response = await api.get(`/student/${id}/`);
  return response.data;
}

export async function getStudentByUser(userId) {
  const response = await api.get("/student/", { params: { user: userId } });
  const data = unwrap(response.data);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function createStudent(studentData) {
  const response = await api.post("/student/", studentData);
  return response.data;
}
