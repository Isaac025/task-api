const pool = require("../config/db");

const getAllTasks = async (req, res, next) => {
  try {
    const {
      completed,
      search,
      page = "1",
      limit = "5",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    // Get the authenticated user's ID from the verified JWT
    const userId = req.user.id;

    // Validate page
    const pageNumber = Number(page);

    if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    // Validate limit
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber <= 0 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    // Validate sorting
    const allowedSortColumns = {
      id: "t.id",
      title: "t.title",
      created_at: "t.created_at",
      completed: "t.completed",
    };

    if (!allowedSortColumns[sortBy]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field",
      });
    }

    if (
      typeof order !== "string" ||
      !["asc", "desc"].includes(order.toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc",
      });
    }

    const normalizedOrder = order.toLowerCase();
    const offset = (pageNumber - 1) * limitNumber;

    // Always restrict results to the authenticated user
    const conditions = ["t.user_id = $1"];
    const values = [userId];

    // Completed filter
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

    // Search filter
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

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Fetch only this user's matching tasks
    let query = `
      SELECT
        t.id,
        t.title,
        t.completed,
        t.created_at,
        t.user_id,
        u.name
      FROM tasks AS t
      INNER JOIN users AS u ON t.user_id = u.id
      ${whereClause}
    `;

    // Count only this user's matching tasks
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM tasks AS t
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    // Add pagination parameters
    const queryValues = [...values, limitNumber, offset];
    const limitPlaceholder = values.length + 1;
    const offsetPlaceholder = values.length + 2;

    // Sorting columns are selected from our whitelist above
    query += `
      ORDER BY ${allowedSortColumns[sortBy]} ${normalizedOrder}
      LIMIT $${limitPlaceholder}
      OFFSET $${offsetPlaceholder}
    `;

    const result = await pool.query(query, queryValues);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      count: result.rows.length,
      tasks: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [title.trim(), userId],
    );

    return res.status(201).json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.taskId;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         t.id,
         t.title,
         t.completed,
         t.created_at,
         t.user_id,
         u.name
       FROM tasks AS t
       INNER JOIN users AS u ON t.user_id = u.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [taskId, userId],
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
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    const taskId = req.taskId;
    const userId = req.user.id;

    if (typeof title !== "string" || !title.trim()) {
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
      `UPDATE tasks
       SET title = $1, completed = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [title.trim(), completed, taskId, userId],
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
    next(error);
  }
};

const patchTask = async (req, res, next) => {
  try {
    const taskId = req.taskId;
    const userId = req.user.id;
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
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         completed = COALESCE($2, completed)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        completed !== undefined ? completed : null,
        taskId,
        userId,
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
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.taskId;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [taskId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
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
