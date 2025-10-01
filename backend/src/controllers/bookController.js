import Book from "../models/Book.js";
import mongoose from "mongoose";
import { NotFoundError, ValidationError } from "../errors/index.js";
import { asyncHandler } from "../middleware/async.js";
import { buildFilterQuery, buildSortQuery } from "../utils/queryBuilder.js";
import { uploadBookImages, cloudinary } from "../middleware/upload.js";

/**
 * @desc    Get all books with filtering, sorting and pagination
 * @route   GET /api/books
 * @access  Public
 */
export const getBooks = asyncHandler(async (req, res) => {
  const { 
    search, 
    genre, 
    author, 
    minPrice, 
    maxPrice, 
    sort = "-createdAt", 
    page = 1, 
    limit = 12 
  } = req.query;

  // Build query
  const query = buildFilterQuery({ search, genre, author, minPrice, maxPrice });
  const sortOptions = buildSortQuery(sort);

  // Execute query with pagination
  const [books, total] = await Promise.all([
    Book.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Book.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: books.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit)
    },
    data: books
  });
});

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ValidationError("Invalid book ID format");
  }

  const book = await Book.findById(req.params.id).lean();
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  res.json({
    success: true,
    data: book
  });
});

/**
 * @desc    Create new book with image upload
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = [
  uploadBookImages,
  asyncHandler(async (req, res) => {
    const { title, price, stock, description, author, genre, isbn } = req.body;
    
    if (!title || price === undefined) {
      throw new ValidationError("Title and price are required");
    }

    // Handle image upload
    const imageData = {};
    if (req.files?.mainImage) {
      const mainImage = req.files.mainImage[0];
      imageData.image = {
        url: mainImage.path,
        publicId: mainImage.filename
      };
    }

    if (req.files?.additionalImages) {
      imageData.images = req.files.additionalImages.map(img => ({
        url: img.path,
        publicId: img.filename,
        caption: ""
      }));
    }

    const book = await Book.create({
      title,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      author,
      genre,
      isbn,
      ...imageData,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: book
    });
  })
];

/**
 * @desc    Update book with image handling
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = [
  uploadBookImages,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ValidationError("Invalid book ID format");
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      throw new NotFoundError("Book not found");
    }

    // Handle image updates
    if (req.files?.mainImage) {
      // Delete old image from Cloudinary
      if (book.image?.publicId) {
        await cloudinary.uploader.destroy(book.image.publicId);
      }

      const mainImage = req.files.mainImage[0];
      book.image = {
        url: mainImage.path,
        publicId: mainImage.filename
      };
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== "image" && req.body[key] !== undefined) {
        book[key] = req.body[key];
      }
    });

    book.lastUpdatedBy = req.user._id;
    await book.save();

    res.json({
      success: true,
      data: book
    });
  })
];

/**
 * @desc    Delete book and its images
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ValidationError("Invalid book ID format");
  }

  const book = await Book.findById(req.params.id);
  
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  // Delete images from Cloudinary
  if (book.image?.publicId) {
    await cloudinary.uploader.destroy(book.image.publicId);
  }

  if (book.images?.length > 0) {
    const publicIds = book.images.map(img => img.publicId);
    await Promise.all(
      publicIds.map(publicId => 
        cloudinary.uploader.destroy(publicId)
      )
    );
  }

  await Book.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: { id: req.params.id }
  });
});

/**
 * @desc    Get personalized recommendations for user
 * @route   GET /api/books/recommendations/personalized
 * @access  Private
 */
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  // Simple recommendations based on genre popularity
  const popularBooks = await Book.find({ active: true })
    .sort("-rating -createdAt")
    .limit(12)
    .select("title author price image rating")
    .lean();
  
  res.json({
    success: true,
    data: popularBooks
  });
});