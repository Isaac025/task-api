const TaskControls = ({ filters, setFilters }) => {
  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
    }));
  };

  return (
    <section>
      <h2>Find Tasks</h2>

      <div>
        <label htmlFor="search">Search by title</label>
        <input
          id="search"
          type="search"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="completed">Status</label>
        <select
          id="completed"
          value={filters.completed}
          onChange={(e) => updateFilter("completed", e.target.value)}
        >
          <option value="">All tasks</option>
          <option value="true">Completed</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <div>
        <label htmlFor="sortBy">Sort by</label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
        >
          <option value="created_at">Date created</option>
          <option value="title">Title</option>
          <option value="id">Task ID</option>
          <option value="completed">Status</option>
        </select>
      </div>

      <div>
        <label htmlFor="order">Sort order</label>
        <select
          id="order"
          value={filters.order}
          onChange={(e) => updateFilter("order", e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div>
        <label htmlFor="limit">Tasks per page</label>
        <select
          id="limit"
          value={filters.limit}
          onChange={(e) => updateFilter("limit", Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() =>
          setFilters({
            search: "",
            completed: "",
            page: 1,
            limit: 5,
            sortBy: "created_at",
            order: "desc",
          })
        }
      >
        Reset filters
      </button>
    </section>
  );
};

export default TaskControls;
