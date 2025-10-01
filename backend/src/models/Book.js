import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  author: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  stock: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 0 
  },
  genre: { 
    type: String, 
    required: true 
  },
  isbn: { 
    type: String, 
    unique: true 
  },
  image: {
    url: String,
    publicId: String,
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  lastUpdatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { 
  timestamps: true 
});

// Text search index
bookSchema.index({ 
  title: "text", 
  author: "text", 
  description: "text" 
});

export default mongoose.model("Book", bookSchema);