import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getTasks } from "./api/taskApi";
import TaskList from "./components/TaskList";
import CreateTask from "./components/CreateTask";
import TaskControls from "./components/TaskControls";

const initialFilters = {
  search: "",
  completed: "",
  page: 1,
  limit: 5,
  sortBy: "created_at",
  order: "desc",
};

const TaskManager = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);

  const token = localStorage.getItem("token");

  const tasksQuery = useQuery({
    queryKey: ["tasks", filters],

    queryFn: async () => {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.order,
      };

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.completed !== "") {
        params.completed = filters.completed;
      }

      return getTasks(params);
    },

    enabled: Boolean(token),
    retry: false,
  });

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await tasksQuery.refetch().catch(() => {});
    navigate("/login");
  };

  if (!token) {
    return (
      <main className="p-6">
        <h1 className="mb-3 text-xl font-bold">Task Manager</h1>
        <p className="mb-4">Please log in to manage your tasks.</p>

        <button
          onClick={() => navigate("/login")}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go to Login
        </button>
      </main>
    );
  }

  if (tasksQuery.isPending) {
    return <p className="p-6">Loading tasks...</p>;
  }

  if (tasksQuery.isError) {
    const status = tasksQuery.error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");

      return (
        <main className="p-6">
          <p>Your session has expired. Please log in again.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </main>
      );
    }

    return (
      <p className="p-6">Failed to fetch tasks: {tasksQuery.error.message}</p>
    );
  }

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination = tasksQuery.data?.pagination;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Task Manager</h1>

        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Log Out
        </button>
      </div>

      <CreateTask onTaskCreated={tasksQuery.refetch} />

      <hr className="my-5" />

      <TaskControls filters={filters} setFilters={setFilters} />

      <hr className="my-5" />

      <h2 className="mb-3 text-xl font-semibold">Your Tasks</h2>

      {tasksQuery.isFetching && <p>Refreshing tasks...</p>}

      <TaskList tasks={tasks} onTasksChanged={tasksQuery.refetch} />

      {pagination && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p>
            Page {pagination.page} of {pagination.totalPages}
            {" · "}
            {pagination.total} total tasks
          </p>

          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default TaskManager;
