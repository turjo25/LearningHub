/**
 * Auth API: register, login (JWT), logout (blacklist), getCurrentUser, forgot/reset password, profile.
 * Uses api (axios) which attaches JWT and handles 401.
 */
import api from './api';

const ACCOUNTS = '/accounts';

/** Register: email, username, password, first_name, last_name, role, phone (optional). Returns user + tokens. */
export async function registerUser(userData) {
  const { data } = await api.post(`${ACCOUNTS}/register/`, userData);
  if (data.tokens) {
    localStorage.setItem('token', data.tokens.access);
    localStorage.setItem('refresh', data.tokens.refresh);
  }
  return data;
}

/** Login: email or username + password. Returns user + tokens. */
export async function loginUser(credentials) {
  const { data } = await api.post(`${ACCOUNTS}/login/`, credentials);
  if (data.tokens) {
    localStorage.setItem('token', data.tokens.access);
    localStorage.setItem('refresh', data.tokens.refresh);
  }
  return {
    token: data.tokens?.access,
    refresh: data.tokens?.refresh,
    user: {
      id: data.user_id,
      username: data.username,
      email: data.email,
      role: data.role,
    },
  };
}

/** Get current user (id, username, email, role). Uses protected endpoint which includes role. */
export async function getCurrentUser() {
  const { data } = await api.get('/protected/');
  return { user: data?.user ?? null };
}

/** Get profile (for profile page). */
export async function getProfile() {
  const { data } = await api.get(`${ACCOUNTS}/profile/`);
  return data;
}

/** Logout: blacklist refresh token. Optional body: { refresh }. */
export async function logoutUser() {
  const refresh = localStorage.getItem('refresh');
  try {
    if (refresh) await api.post(`${ACCOUNTS}/logout/`, { refresh });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
  }
}

/** Forgot password: send email with reset link. */
export async function forgotPassword(email) {
  const { data } = await api.post(`${ACCOUNTS}/forgot-password/`, { email });
  return data;
}

/** Reset password: token (from email) + new_password. */
export async function resetPassword(token, newPassword) {
  const { data } = await api.post(`${ACCOUNTS}/reset-password/`, { token, new_password: newPassword });
  return data;
}

/** Update profile. */
export async function updateProfile(updates) {
  const { data } = await api.patch(`${ACCOUNTS}/profile/`, updates);
  return data;
}
