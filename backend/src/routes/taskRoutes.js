const express = require("express");
const {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  patchTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const validateTaskId = require("../middleware/validateTaskId");

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.get("/", getAllTasks);
router.post("/", createTask);
router.get("/:id", validateTaskId, getTaskById);
router.put("/:id", validateTaskId, updateTask);
router.delete("/:id", validateTaskId, deleteTask);
router.patch("/:id", validateTaskId, patchTask);
module.exports = router;
