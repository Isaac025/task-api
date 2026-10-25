import apiClient from "./apiClient";

export const getTasks = async (params = {}) => {
  const response = await apiClient.get("/tasks", {
    params,
  });

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post("/tasks", taskData);

  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await apiClient.patch(`/tasks/${id}`, taskData);

  return response.data;
};

export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);

  return response.data;
};
