const TaskList = ({ tasks }) => {
  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>

          <p>Status: {task.completed ? "Completed" : "Pending"}</p>

          <p>Created by: {task.name}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
