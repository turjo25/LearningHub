import api, { unwrap } from "./api";

export async function getCategories() {
  const res = await api.get("/category/");
  return unwrap(res.data);
}

export async function getCategoryById(id) {
  const res = await api.get(`/category/${id}/`);
  return res.data;
}

export async function createCategory(data) {
  const res = await api.post("/category/", data);
  return res.data;
}
