import axios from "axios";

const API_URL = "http://localhost:8000/api";

export async function createStudent(studentData) {
  try {
    const response = await axios.post(`${API_URL}/student/`, studentData,
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

export async function getTeacherDetails(id) {
  try {
    const response = await axios.get(`${API_URL}/teacher/${id}/`,
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