import axios from "axios";

const API_URL = "http://localhost:8000/api";

export async function createEnrollment(enrollmentData) {
  try {
    const response = await axios.post(`${API_URL}/enrollment/`, enrollmentData,
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