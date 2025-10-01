import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  orderNumber: { 
    type: String, 
    unique: true 
  },
  customer: {
    name: String,
    phone: String,
    email: String
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    country: String,
    phone: String
  },
  items: [{
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book" 
    },
    title: String,
    price: Number,
    qty: Number,
    subtotal: Number
  }],
  subtotal: { 
    type: Number, 
    required: true 
  },
  shipping: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ["MPESA", "CARD", "WALLET"], 
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
  mpesa: {
    merchantRequestId: String,
    checkoutRequestId: String,
    response: Object,
    callback: Object,
    metadata: Object,
    error: String
  },
  notes: String
}, { 
  timestamps: true 
});

// Generate order number before saving
orderSchema.pre("save", async function(next) {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);