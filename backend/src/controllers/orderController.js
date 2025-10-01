import Order from "../models/Order.js";
import Book from "../models/Book.js";
import { stkPush } from "../services/mpesaService.js";
import {
  NotFoundError,
  ValidationError,
  PaymentError
} from "../errors/index.js";
import { asyncHandler } from "../middleware/async.js";
import { sendOrderConfirmation } from "../services/emailService.js";

/**
 * @desc    Create new order with MPESA payment and email notification
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingFee = 0, shippingAddress } = req.body;

  if (!items?.length) {
    throw new ValidationError("Cart is empty");
  }

  // Process order items and validate stock
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.book || !item.qty || item.qty < 1) {
      throw new ValidationError("Each item must have a valid book ID and quantity");
    }

    const book = await Book.findById(item.book);
    if (!book) throw new NotFoundError(`Book ${item.book} not found`);
    if (book.stock < item.qty) {
      throw new ValidationError(`Insufficient stock for ${book.title}`);
    }

    const itemSubtotal = book.price * item.qty;
    processedItems.push({
      book: book._id,
      title: book.title,
      price: book.price,
      qty: item.qty,
      subtotal: itemSubtotal
    });

    subtotal += itemSubtotal;
  }

  const total = subtotal + shippingFee;

  // Ensure authenticated user's phone exists and is valid for MPESA
  const userPhone = req.user?.phone;
  if (!userPhone || !/^254[17]\d{8}$/.test(userPhone)) {
    throw new ValidationError("Authenticated user must have a valid MPESA phone number on their profile (254XXXXXXXXX)");
  }

  // Create order tied to authenticated user
  const order = await Order.create({
    user: req.user._id,
    customer: {
      name: req.user.name || "",
      phone: userPhone,
      email: req.user.email || ""
    },
    shippingAddress: shippingAddress,
    items: processedItems,
    subtotal,
    shipping: shippingFee,
    total,
    paymentMethod: "MPESA",
    paymentStatus: "PENDING",
    status: "PROCESSING"
  });

  try {
    // Initiate MPESA payment
    const mpesaResponse = await stkPush({
      phone: userPhone,
      amount: Math.round(total),
      accountRef: order._id.toString(),
      callbackUrl: `${process.env.API_BASE_URL}/api/orders/mpesa/callback`
    });

    // Attach MPESA details to order and save
    order.mpesa = {
      merchantRequestId: mpesaResponse.MerchantRequestID,
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
      response: mpesaResponse
    };
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total,
        mpesa: mpesaResponse
      }
    });
  } catch (error) {
    // Mark order as failed if stkPush errors
    order.paymentStatus = "FAILED";
    order.mpesa = { error: error.message || String(error) };
    await order.save();
    throw new PaymentError("MPESA payment initiation failed");
  }
});

/**
 * @desc    MPESA payment callback handler with email notification
 * @route   POST /api/orders/mpesa/callback
 * @access  Public
 */
export const mpesaCallback = asyncHandler(async (req, res) => {
  const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || req.body;
  if (!callback) {
    return res.status(400).json({ message: "Invalid MPESA callback format" });
  }

  const accountRef = callback?.CallbackMetadata?.Item
    ?.find(item => item.Name === "AccountReference")?.Value;

  const checkoutRequestId = callback?.CheckoutRequestID || callback?.CheckoutRequestId || callback?.checkoutRequestID;
  const resultCode = callback?.ResultCode ?? callback?.resultCode ?? null;

  // Find the corresponding order
  const order = await Order.findOne({
    $or: [
      accountRef ? { _id: accountRef } : null,
      { "mpesa.checkoutRequestId": checkoutRequestId }
    ].filter(Boolean)
  }).populate("user");

  if (!order) {
    console.error("Order not found for MPESA callback", { accountRef, checkoutRequestId });
    return res.json({ status: "OK" });
  }

  // Idempotency: if already PAID, just respond OK
  if (order.paymentStatus === "PAID") {
    return res.json({ status: "OK", message: "Order already processed" });
  }

  // Attach full callback for record
  order.mpesa = order.mpesa || {};
  order.mpesa.callback = callback;

  // Update paymentStatus based on ResultCode (0 = success)
  const success = Number(resultCode) === 0;
  order.paymentStatus = success ? "PAID" : "FAILED";

  if (success) {
    // Extract metadata
    const metadata = {};
    (callback?.CallbackMetadata?.Item || []).forEach(item => {
      if (item?.Name && item?.Value !== undefined) {
        metadata[item.Name] = item.Value;
      }
    });
    order.mpesa.metadata = metadata;

    // Decrement stock for each item
    await Promise.all(
      order.items.map(item =>
        Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.qty } })
      )
    );

    // Send confirmation email
    if (order.user) {
      try {
        await sendOrderConfirmation(order, order.user);
        console.log("Order confirmation email sent for order:", order.orderNumber);
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Don't throw error - email failure shouldn't fail the payment
      }
    }
  } else {
    order.mpesa.error = callback?.ResultDesc || callback?.resultDesc || "MPESA payment failed";
  }

  await order.save();
  res.json({ status: "OK" });
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.paymentStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments(filter)
  ]);

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

/**
 * @desc    Get order by ID (Admin or owner)
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.book", "title price image");

  if (!order) throw new NotFoundError("Order not found");

  // Allow only owner or admin
  if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  res.json({ success: true, data: order });
});

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
    throw new ValidationError("Invalid status value");
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new NotFoundError("Order not found");

  order.status = status;
  
  // Update timestamps for shipping/delivery
  if (status === "SHIPPED" && !order.shippedAt) {
    order.shippedAt = new Date();
  } else if (status === "DELIVERED" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }
  
  await order.save();

  res.json({ success: true, data: order });
});

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("items.book", "title price image"),
    Order.countDocuments({ user: req.user._id })
  ]);

  res.json({ 
    success: true, 
    count: orders.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    },
    data: orders 
  });
});

/**
 * @desc    Retry payment for failed order
 * @route   POST /api/orders/:id/retry-payment
 * @access  Private
 */
export const retryPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Check if user owns the order or is admin
  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    throw new ValidationError("Not authorized to retry this payment");
  }

  if (order.paymentStatus !== "FAILED") {
    throw new ValidationError("Can only retry failed payments");
  }

  const userPhone = req.user.phone;
  if (!userPhone || !/^254[17]\d{8}$/.test(userPhone)) {
    throw new ValidationError("Valid MPESA phone number required");
  }

  try {
    // Initiate MPESA payment again
    const mpesaResponse = await stkPush({
      phone: userPhone,
      amount: Math.round(order.total),
      accountRef: order._id.toString(),
      callbackUrl: `${process.env.API_BASE_URL}/api/orders/mpesa/callback`
    });

    // Update order with new MPESA attempt
    order.paymentStatus = "PENDING";
    order.mpesa = {
      merchantRequestId: mpesaResponse.MerchantRequestID,
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
      response: mpesaResponse,
      retryAttempts: (order.mpesa?.retryAttempts || 0) + 1
    };
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        mpesa: mpesaResponse
      }
    });
  } catch (error) {
    throw new PaymentError("Payment retry failed: " + error.message);
  }
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Check if user owns the order or is admin
  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    throw new ValidationError("Not authorized to cancel this order");
  }

  // Only allow cancellation for pending or processing orders
  if (!["PENDING", "PROCESSING"].includes(order.paymentStatus)) {
    throw new ValidationError("Cannot cancel order with current status");
  }

  order.status = "CANCELLED";
  order.paymentStatus = "FAILED";
  await order.save();

  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Get order statistics for admin
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$total" }
      }
    }
  ]);

  const totalStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        avgOrderValue: { $avg: "$total" }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      statusStats: stats,
      overall: totalStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
    }
  });
});