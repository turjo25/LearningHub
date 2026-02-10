import axios from "axios";

const API_URL = "http://localhost:8000/api";

export async function createCourse(courseData) {
  try {
    const response = await axios.post(`${API_URL}/course/`, courseData,
      {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getCourses() {
  try {
    const response = await axios.get(`${API_URL}/course/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCourseById(courseId) {
  try {
    const response = await axios.get(`${API_URL}/course/${courseId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
