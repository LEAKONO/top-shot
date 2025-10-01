import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('🔴 Missing required environment variables:', missingEnvVars.join(', '));
  console.log('💡 Please check your .env file exists and contains all required variables');
  process.exit(1);
}

// Import the central router
import routes from "./routes/index.js";
// import { swaggerSetup } from './config/swagger.js'; // Keep commented for now

const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());
app.use(cookieParser());

// ======================
// Rate Limiting
// ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ======================
// CORS
// ======================
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ======================
// Body Parser with increased limit for image uploads
// ======================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
// Global error handler
// ======================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ======================
// 404 handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ======================
// Database Connection & Server Startup
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('   Database URI:', process.env.MONGO_URI);
    
    // MongoDB connection options
    const mongooseOptions = {
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log("✅ MongoDB Connected successfully!");
    
    const server = app.listen(PORT, () => {
      console.log(`\n🎉 Server started successfully!`);
      console.log(`=================================`);
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
      console.log(`=================================\n`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("🔴 Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("🔴 Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (err) {
    console.error("🔴 MongoDB connection failed:", err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if MongoDB is running:');
    console.log('      - On Ubuntu: sudo systemctl status mongod');
    console.log('      - Start it: sudo systemctl start mongod');
    console.log('   2. Install MongoDB if needed:');
    console.log('      - Ubuntu: sudo apt install mongodb');
    console.log('      - Or download from https://www.mongodb.com/try/download/community');
    console.log('   3. Try connecting manually:');
    console.log('      mongosh "mongodb://localhost:27017"');
    console.log('   4. Check if the port is correct (default is 27017)');
    process.exit(1);
  }
};

startServer();