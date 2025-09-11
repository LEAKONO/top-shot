import Cart from "../models/Cart.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../middleware/async.js";
import { ValidationError, NotFoundError } from "../errors/index.js";

/**
 * @desc    Get user’s cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.book", "title price stock image");
  
  res.json({
    success: true,
    data: cart || { items: [] }
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { bookId, qty } = req.body;
  if (!bookId || !qty || qty < 1) {
    throw new ValidationError("Book ID and valid quantity are required");
  }

  const book = await Book.findById(bookId);
  if (!book) throw new NotFoundError("Book not found");

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ book: bookId, qty }]
    });
  } else {
    const existingItem = cart.items.find(i => i.book.toString() === bookId);
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ book: bookId, qty });
    }
    await cart.save();
  }

  await cart.populate("items.book", "title price stock image");
  res.status(201).json({ success: true, data: cart });
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/:bookId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  if (!qty || qty < 1) {
    throw new ValidationError("Valid quantity required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new NotFoundError("Cart not found");

  const item = cart.items.find(i => i.book.toString() === req.params.bookId);
  if (!item) throw new NotFoundError("Item not in cart");

  item.qty = qty;
  await cart.save();

  await cart.populate("items.book", "title price stock image");
  res.json({ success: true, data: cart });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:bookId
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new NotFoundError("Cart not found");

  cart.items = cart.items.filter(i => i.book.toString() !== req.params.bookId);
  await cart.save();

  res.json({ success: true, data: cart });
});

/**
 * @desc    Clear user cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, data: { items: [] } });
});
