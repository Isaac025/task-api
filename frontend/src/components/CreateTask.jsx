import { useState } from "react";
import { createTask } from "../api/taskApi";

const CreateTask = ({ onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      setError("Please enter a valid user ID.");
      return;
    }

    try {
      setLoading(true);

      const data = await createTask({
        title: title.trim(),
        user_id: Number(userId),
      });

      setSuccess(data.message || "Task created successfully!");
      setTitle("");

      // Ask the parent component to refresh the list.
      await onTaskCreated();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create task. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a Task</h2>

      <div>
        <label htmlFor="title">Task title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Learn PostgreSQL"
          required
        />
      </div>

      <div>
        <label htmlFor="userId">User ID</label>
        <input
          id="userId"
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </form>
  );
};

export default CreateTask;
