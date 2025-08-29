import Book from "../models/Book.js";
import mongoose from "mongoose";
import { NotFoundError, ValidationError } from "../errors/index.js";
import { asyncHandler } from "../middleware/async.js";
import { buildFilterQuery, buildSortQuery } from "../utils/queryBuilder.js";

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
 * @desc    Create new book
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = asyncHandler(async (req, res) => {
  const { title, price, stock } = req.body;
  
  if (!title || price === undefined) {
    throw new ValidationError("Title and price are required");
  }

  const book = await Book.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ValidationError("Invalid book ID format");
  }

  const book = await Book.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      lastUpdatedBy: req.user._id
    },
    { 
      new: true,
      runValidators: true 
    }
  );

  if (!book) {
    throw new NotFoundError("Book not found");
  }

  res.json({
    success: true,
    data: book
  });
});

/**
 * @desc    Delete book
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ValidationError("Invalid book ID format");
  }

  const book = await Book.findByIdAndDelete(req.params.id);
  
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  res.json({
    success: true,
    data: { id: req.params.id }
  });
});