const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  const taskId = Number(id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }

  req.taskId = taskId;

  next();
};

module.exports = validateTaskId;
