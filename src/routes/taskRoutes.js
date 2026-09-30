const express = require("express");
const {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const router = express.Router();

router.get("/", getAllTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
module.exports = router;
