import api, { unwrap } from "./api";

export async function getAssignments(params = {}) {
  const response = await api.get("/assignment/", { params });
  return unwrap(response.data);
}

export async function getAssignmentById(id) {
  const response = await api.get(`/assignment/${id}/`);
  return response.data;
}

export async function getAssignmentsByCourse(courseId) {
  return getAssignments({ course: courseId });
}

export async function createAssignment(data) {
  const response = await api.post("/assignment/", data);
  return response.data;
}

export async function updateAssignment(id, data) {
  const response = await api.put(`/assignment/${id}/`, data);
  return response.data;
}

export async function deleteAssignment(id) {
  const response = await api.delete(`/assignment/${id}/`);
  return response.data;
}
