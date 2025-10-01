import express from "express";
import bookRoutes from "./books.js";
import orderRoutes from "./orders.js";
import adminRoutes from "./admin.js";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";

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
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 uptime:
 *                   type: number
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Mount route files
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);

export default router;