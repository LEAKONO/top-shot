import express from "express";
import bookRoutes from "./books.js";
import orderRoutes from "./orders.js";
import adminRoutes from "./admin.js";
import authRoutes from "./auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Redirect to API documentation
 *     tags: [System]
 *     responses:
 *       302:
 *         description: Redirect to Swagger UI
 */
router.get("/docs", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/api-docs`);
});

// Mount route files
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);

export default router;