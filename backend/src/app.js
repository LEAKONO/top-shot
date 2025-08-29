import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { swaggerSetup } from './config/swagger.js';

// ... after all other middleware but before routes
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// ======================
// Body Parsing Middleware
// ======================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ======================
// Development Logging
// ======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ======================
// API Routes
// ======================
app.use("/api", routes);

// ======================
// Error Handling
// ======================
app.use(errorHandler);
swaggerSetup(app);

// ======================
// Database Connection & Server Startup
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`API Documentation: ${process.env.FRONTEND_URL}/api-docs`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("🔴 Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("🔴 Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (err) {
    console.error("🔴 Server startup error:", err);
    process.exit(1);
  }
};

startServer();