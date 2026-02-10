import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    loginUser({
      phone: userData.phone,
      password: userData.password
    });
    return response.data;
  } catch (error) {
    console.log(error);

  }
}

export async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      phone: credentials.phone, // Using phone field
      password: credentials.password,
    });

    return {
      token: response.data.tokens.access,
      refresh: response.data.tokens.refresh,
      user: {
        id: response.data.user_id,
        username: response.data.username,
      },
    };
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { user: null };
    }

    const response = await axios.get(`${API_URL}/protected/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('getCurrentUser response:', response.data);
    return { user: response.data };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return { user: null };
  }
}