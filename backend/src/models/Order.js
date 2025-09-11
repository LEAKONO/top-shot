// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    match: [/^254[17]\d{8}$/, "Please use valid MPESA phone format (254XXXXXXXXX)"]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true
  }
});

const mpesaSchema = new mongoose.Schema({
  merchantRequestId: String,
  checkoutRequestId: String,
  response: mongoose.Schema.Types.Mixed,
  callback: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true // orders must be tied to an authenticated user
    },
    items: [orderItemSchema],
    // keep customer snapshot (useful for shipping / historical record)
    customer: customerSchema,
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["MPESA", "CASH", "CARD"],
      default: "MPESA"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    status: {
      type: String,
      enum: ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PROCESSING"
    },
    mpesa: mpesaSchema,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for fast lookups
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ "mpesa.checkoutRequestId": 1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
