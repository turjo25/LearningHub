import api, { unwrap } from "./api";

export async function getResults(params = {}) {
  const response = await api.get("/results/", { params });
  return unwrap(response.data);
}

export async function getResultById(id) {
  const response = await api.get(`/results/${id}/`);
  return response.data;
}

export async function createResult(data) {
  const response = await api.post("/results/", data);
  return response.data;
}

export async function updateResult(id, data) {
  const response = await api.put(`/results/${id}/`, data);
  return response.data;
}
