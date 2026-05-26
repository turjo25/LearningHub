import api, { unwrap } from "./api";

export async function createEnrollment(enrollmentData) {
  const response = await api.post("/enrollment/", enrollmentData);
  return response.data;
}

export async function getEnrollments(params = {}) {
  const response = await api.get("/enrollment/", { params });
  return unwrap(response.data);
}

export async function deleteEnrollment(id) {
  const response = await api.delete(`/enrollment/${id}/`);
  return response.data;
}
