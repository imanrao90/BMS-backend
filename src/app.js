import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";
import authRoutes from "./modules/auth/auth.routes.js";

export const app = express()

/* =========================
   Global Middlewares
========================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Health Check
========================= */

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.get("/api/v1/test-error", (req, res, next) => {
  next(new AppError("This is a test error", 400));
});

/* =========================
   Routes
========================= */

// Routes will be added here
// Example:
// app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/auth", authRoutes);

/* =========================
   404 Handler
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================
   Global Error Handler
========================= */

// Add this after creating errorHandler.js
// import errorHandler from "./middleware/errorHandler.js";
// app.use(errorHandler);

app.use(errorHandler)

export default app;