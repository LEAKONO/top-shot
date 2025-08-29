import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: String,
  city: String,
  details: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true, unique: true, sparse: true },
  phone: { type: String, index: true, sparse: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
