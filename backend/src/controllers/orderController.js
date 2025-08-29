import Order from "../models/Order.js";
import Book from "../models/Book.js";
import { stkPush } from "../services/mpesaService.js";
import { 
  NotFoundError, 
  ValidationError,
  PaymentError 
} from "../errors/index.js";
import { asyncHandler } from "../middleware/async.js";

/**
 * @desc    Create new guest order with MPESA payment
 * @route   POST /api/orders/guest
 * @access  Public
 */
export const createGuestOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingFee = 0 } = req.body;

  // Validate input
  if (!items?.length) {
    throw new ValidationError("Cart is empty");
  }

  if (!customer?.phone || !/^254[17]\d{8}$/.test(customer.phone)) {
    throw new ValidationError("Valid MPESA phone number (254XXXXXXXXX) is required");
  }

  // Process order items and validate stock
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.book || !item.qty || item.qty < 1) {
      throw new ValidationError("Each item must have a valid book ID and quantity");
    }

    const book = await Book.findById(item.book);
    if (!book) {
      throw new NotFoundError(`Book ${item.book} not found`);
    }

    if (book.stock < item.qty) {
      throw new ValidationError(`Insufficient stock for ${book.title}`);
    }

    processedItems.push({
      book: book._id,
      title: book.title,
      price: book.price,
      qty: item.qty
    });

    subtotal += book.price * item.qty;
  }

  const total = subtotal + shippingFee;

  // Create order
  const order = await Order.create({
    items: processedItems,
    customer,
    subtotal,
    shipping: shippingFee,
    total,
    paymentMethod: "MPESA",
    paymentStatus: "PENDING"
  });

  try {
    // Initiate MPESA payment
    const mpesaResponse = await stkPush({
      phone: customer.phone,
      amount: Math.round(total),
      accountRef: order._id.toString(),
      callbackUrl: `${process.env.API_BASE_URL}/api/orders/mpesa/callback`
    });

    // Update order with MPESA details
    order.mpesa = {
      merchantRequestId: mpesaResponse.merchantRequestId,
      checkoutRequestId: mpesaResponse.checkoutRequestId,
      response: mpesaResponse
    };
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        mpesa: mpesaResponse
      }
    });
  } catch (error) {
    // Mark order as failed
    order.paymentStatus = "FAILED";
    order.mpesa = { error: error.message };
    await order.save();

    throw new PaymentError("MPESA payment initiation failed");
  }
});

/**
 * @desc    MPESA callback handler
 * @route   POST /api/orders/mpesa/callback
 * @access  Public (MPESA calls this)
 */
export const mpesaCallback = asyncHandler(async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback) {
    throw new ValidationError("Invalid MPESA callback format");
  }

  // Extract order reference
  const accountRef = callback.CallbackMetadata?.Item
    ?.find(item => item.Name === "AccountReference")?.Value;

  const checkoutRequestId = callback.CheckoutRequestID;
  const resultCode = callback.ResultCode;

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: accountRef },
      { "mpesa.checkoutRequestId": checkoutRequestId }
    ]
  });

  if (!order) {
    console.error("Order not found for MPESA callback", { accountRef, checkoutRequestId });
    return res.json({ status: "OK" }); // Respond OK to prevent MPESA retries
  }

  // Update order status
  order.mpesa.callback = callback;
  order.paymentStatus = resultCode === 0 ? "PAID" : "FAILED";

  if (resultCode === 0) {
    // Process successful payment
    const metadata = {};
    callback.CallbackMetadata?.Item?.forEach(item => {
      if (item.Name && item.Value !== undefined) {
        metadata[item.Name] = item.Value;
      }
    });

    order.mpesa.metadata = metadata;

    // Update stock levels
    await Promise.all(
      order.items.map(item => 
        Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.qty } })
      )
    ); // This was the missing closing parenthesis
  }

  await order.save();
  res.json({ status: "OK" });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (status) query.paymentStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("items.book", "title price"),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit)
    },
    data: orders
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private/Admin
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.book", "title price author");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
    throw new ValidationError("Invalid status value");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  res.json({
    success: true,
    data: order
  });
});