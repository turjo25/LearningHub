import api, { unwrap } from "./api";

export async function getSubmissions(params = {}) {
  const response = await api.get("/submission/", { params });
  return unwrap(response.data);
}

export async function getSubmissionById(id) {
  const response = await api.get(`/submission/${id}/`);
  return response.data;
}

export async function createSubmission(data) {
  const response = await api.post("/submission/", data);
  return response.data;
}

export async function updateSubmission(id, data) {
  const response = await api.put(`/submission/${id}/`, data);
  return response.data;
}
