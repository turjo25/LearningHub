/**
 * LMS API: courses, categories, enrollments, dashboard (api/lms/).
 * Uses api (axios) which attaches JWT.
 */
import api from './api';

const LMS = '/lms';

export async function getCategories() {
  const { data } = await api.get(`${LMS}/categories/`);
  return data;
}

export async function createCategory(name, description = '') {
  const { data } = await api.post(`${LMS}/categories/`, { name, description });
  return data;
}

export async function getCourses() {
  const { data } = await api.get(`${LMS}/courses/`);
  return data;
}

export async function getCourseById(id) {
  const { data } = await api.get(`${LMS}/courses/${id}/`);
  return data;
}

export async function createCourse(courseData) {
  const { data } = await api.post(`${LMS}/courses/`, courseData);
  return data;
}

export async function updateCourse(id, courseData) {
  const { data } = await api.patch(`${LMS}/courses/${id}/`, courseData);
  return data;
}

export async function deleteCourse(id) {
  await api.delete(`${LMS}/courses/${id}/`);
}

export async function getEnrollments() {
  const { data } = await api.get(`${LMS}/enrollments/`);
  return data;
}

export async function enrollInCourse(courseId) {
  const { data } = await api.post(`${LMS}/enrollments/`, { course: courseId });
  return data;
}

export async function getDashboardSummary() {
  const { data } = await api.get(`${LMS}/dashboard/summary/`);
  return data;
}

export async function getInstructors() {
  const { data } = await api.get(`${LMS}/instructors/`);
  return data;
}
