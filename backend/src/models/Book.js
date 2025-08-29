import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"]
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      enum: {
        values: [
          "Fiction", "Non-Fiction", "Science", "History", 
          "Biography", "Business", "Children", "Other"
        ],
        message: "Invalid genre"
      }
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    image: {
      type: String,
      default: "default-book.jpg"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastUpdatedBy: {
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

// Text index for search
bookSchema.index({ title: "text", author: "text", description: "text" });

bookSchema.index({ genre: 1, price: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ stock: 1 });

const Book = mongoose.model("Book", bookSchema);

export default Book;