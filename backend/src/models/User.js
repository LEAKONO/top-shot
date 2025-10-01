import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^254[17]\d{8}$/, "Please enter a valid MPESA phone number (254XXXXXXXXX)"]
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  addresses: [{
    name: String,
    street: String,
    city: String,
    country: { type: String, default: "Kenya" },
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book" 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);