import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getTasks = async (params = {}) => {
  const response = await axios.get(`${API_URL}/tasks`, {
    params,
  });

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData);

  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axios.patch(`${API_URL}/tasks/${id}`, taskData);

  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`);

  return response.data;
};
