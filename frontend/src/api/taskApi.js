import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getTasks = async (params = {}) => {
  const response = await axios.get(`${API_URL}/tasks`, {
    params,
  });

  return response.data;
};
