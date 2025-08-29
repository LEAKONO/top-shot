import express from "express";
import { 
  getSalesSummary,
  getRecentOrders,
  getInventoryStatus 
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many admin requests, please try again later"
});

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard analytics
 */

// All routes below require admin authentication
router.use(protect, admin, adminLimiter);

/**
 * @swagger
 * /api/admin/analytics/summary:
 *   get:
 *     summary: Get sales analytics summary
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalOrders:
 *                           type: number
 *                         avgOrderValue:
 *                           type: number
 *                     bestSellers:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get("/analytics/summary", getSalesSummary);

/**
 * @swagger
 * /api/admin/analytics/orders:
 *   get:
 *     summary: Get recent orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics/orders", getRecentOrders);

/**
 * @swagger
 * /api/admin/analytics/inventory:
 *   get:
 *     summary: Get inventory status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory status data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lowStock:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics/inventory", getInventoryStatus);

export default router;