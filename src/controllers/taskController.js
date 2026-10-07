const pool = require("../config/db");

const getAllTasks = async (req, res) => {
  try {
    const { completed, user_id, search } = req.query;

    let query = `
      SELECT
        t.id,
        t.title,
        t.completed,
        t.created_at,
        t.user_id,
        u.name
      FROM tasks as t
      INNER JOIN users as u
        ON t.user_id = u.id
    
      `;

    const conditions = [];
    const values = [];

    // completed filter
    if (completed !== undefined) {
      if (completed !== "true" && completed !== "false") {
        return res.status(400).json({
          success: false,
          message: "Completed must be true or false",
        });
      }

      values.push(completed === "true");
      conditions.push(`t.completed = $${values.length}`);
    }

    // user_id filter
    if (user_id !== undefined) {
      const user_Id = Number(user_id);

      if (!Number.isInteger(user_Id) || user_Id <= 0) {
        return res.status(400).json({
          success: false,
          message: "A valid user_id is required",
        });
      }

      values.push(user_id);
      conditions.push(`t.user_id = $${values.length}`);
    }

    // search filter
    if (search !== undefined) {
      if (typeof search !== "string" || !search.trim()) {
        return res.status(400).json({
          success: false,
          message: "Search must be a valid value",
        });
      }
      values.push(`%${search.trim()}%`);
      conditions.push(`t.title ILIKE $${values.length}`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    //sorting by id in descending order
    query += ` ORDER BY t.id DESC`;

    const result = await pool.query(query, values);

    res
      .status(200)
      .json({ success: true, count: result.rows.length, tasks: result.rows });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, user_id } = req.body;

    // if (!title || !user_id) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Title and user_id are required" });
    // }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "a valid title is required" });
    }

    if (!Number.isInteger(user_id) || user_id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "A valid user_id is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (title, user_id)
      VALUES ($1, $2)
      RETURNING *
    `,
      [title.trim(), user_id],
    );

    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error("Error creating task:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    res.status(500).json({ success: false, message: "Failed creating task" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = req.taskId;

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.completed,
        t.created_at,
        u.name
      FROM tasks as t
      INNER JOIN users as u
        ON t.user_id = u.id
      WHERE t.id = $1
    `,
      [taskId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, completed } = req.body;

    const taskId = req.taskId;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid title is required",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false",
      });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1, completed = $2
      WHERE id = $3
      RETURNING *
    `,
      [title.trim(), completed, taskId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

const patchTask = async (req, res) => {
  try {
    const taskId = req.taskId;

    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide title or completed to update",
      });
    }

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Title must be a valid string",
      });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false",
      });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed)
      WHERE id = $3
      RETURNING *
      `,
      [
        title !== undefined ? title.trim() : null,
        completed !== undefined ? completed : null,
        taskId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating task:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.taskId;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *
    `,
      [taskId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  patchTask,
  deleteTask,
};
