import { useState } from "react";
import { updateTask, deleteTask } from "../api/taskApi";

const TaskList = ({ tasks, onTasksChanged }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setError("");
  };

  const handleUpdate = async (task) => {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setLoadingId(task.id);
      setError("");

      await updateTask(task.id, {
        title: editTitle.trim(),
      });

      setEditingId(null);
      await onTasksChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (task) => {
    try {
      setLoadingId(task.id);
      setError("");

      await updateTask(task.id, {
        completed: !task.completed,
      });

      await onTasksChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      setLoadingId(id);
      setError("");

      await deleteTask(id);
      await onTasksChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task.");
    } finally {
      setLoadingId(null);
    }
  };

  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
          }}
        >
          {editingId === task.id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                aria-label={`Edit task ${task.id}`}
              />

              <button
                onClick={() => handleUpdate(task)}
                disabled={loadingId === task.id}
              >
                {loadingId === task.id ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setEditingId(null)}
                disabled={loadingId === task.id}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h3>{task.title}</h3>

              <p>Status: {task.completed ? "Completed" : "Pending"}</p>

              <p>Created by: {task.name}</p>

              <button
                onClick={() => handleToggle(task)}
                disabled={loadingId === task.id}
              >
                {task.completed ? "Mark Pending" : "Mark Completed"}
              </button>

              <button onClick={() => handleEdit(task)}>Edit</button>

              <button
                onClick={() => handleDelete(task.id)}
                disabled={loadingId === task.id}
              >
                {loadingId === task.id ? "Please wait..." : "Delete"}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
