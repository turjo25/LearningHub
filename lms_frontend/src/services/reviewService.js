import api, { unwrap } from "./api";

export async function getReviews(params = {}) {
  const res = await api.get("/review/", { params });
  return unwrap(res.data);
}

export async function createReview(data) {
  const res = await api.post("/review/", data);
  return res.data;
}

export async function updateReview(id, data) {
  const res = await api.patch(`/review/${id}/`, data);
  return res.data;
}

export async function deleteReview(id) {
  await api.delete(`/review/${id}/`);
}
