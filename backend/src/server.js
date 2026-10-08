require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Task Manager API is running" });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT Now()");
    res.status(200).json({
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Error connecting to the database" });
  }
});

//error handling middleware should be the last middleware added to the stack

app.get("/api/test-error", (req, res, next) => {
  const error = new Error("Something went wrong");

  next(error);
});

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);

  error.statusCode = 404;

  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
