import { useEffect, useState } from "react";
import { getTasks } from "./api/taskApi";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(data.tasks);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Task Manager</h1>

      <TaskList tasks={tasks} />
    </div>
  );
}

export default App;
