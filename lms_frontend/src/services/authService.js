import axios from "axios";
import api, { API_URL } from "./api";

export async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      phone: credentials.phone,
      password: credentials.password,
    });
    return {
      token: response.data.tokens.access,
      refresh: response.data.tokens.refresh,
    };
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await api.get("/protected/");
    // response.data = { message: "...", user: { user_id, username, email, first_name, last_name, role } }
    return response.data.user || null;
  } catch {
    return null;
  }
}

/**
 * Update the current user's profile (first_name, last_name, email).
 */
export async function updateUserProfile(userId, data) {
  const response = await api.patch(`/users/${userId}/`, data);
  return response.data;
}

/**
 * Upload a profile picture for the given user.
 * @param {number} userId
 * @param {File} file
 * @returns {{ avatar_url: string }}
 */
export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post(`/users/${userId}/avatar/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
