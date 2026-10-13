import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

function App() {
  const [filters, setFilters] = useState(initialFilters);

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
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination = tasksQuery.data?.pagination;

  if (tasksQuery.isPending) {
    return <p>Loading tasks...</p>;
  }

  if (tasksQuery.isError) {
    return <p>Failed to fetch tasks: {tasksQuery.error.message}</p>;
  }

  return (
    <main>
      <h1>Task Manager</h1>

      <CreateTask onTaskCreated={tasksQuery.refetch} />

      <hr />

      <TaskControls filters={filters} setFilters={setFilters} />

      <hr />

      <h2>Your Tasks</h2>

      {tasksQuery.isFetching && <p>Refreshing tasks...</p>}

      <TaskList tasks={tasks} onTasksChanged={tasksQuery.refetch} />

      {pagination && (
        <div>
          <p>
            Page {pagination.page} of {pagination.totalPages}
            {" · "}
            {pagination.total} total tasks
          </p>

          <button
            disabled={!pagination.hasPreviousPage}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: current.page - 1,
              }))
            }
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
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
