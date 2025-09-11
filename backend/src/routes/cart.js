import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User shopping cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get logged-in user’s cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User’s cart
 */
router.get("/", protect, getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", protect, addToCart);

/**
 * @swagger
 * /api/cart/{bookId}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:bookId", protect, updateCartItem);

/**
 * @swagger
 * /api/cart/{bookId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:bookId", protect, removeCartItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear user’s cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/", protect, clearCart);

export default router;
