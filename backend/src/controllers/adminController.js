import Order from "../models/Order.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../middleware/async.js";

/**
 * @desc    Get recent orders
 * @route   GET /api/admin/analytics/orders
 * @access  Private/Admin
 */
export const getRecentOrders = asyncHandler(async (req, res) => {
  const recentOrders = await Order.find({ paymentStatus: "PAID" })
    .sort("-createdAt")
    .limit(5)
    .populate("user", "name email")
    .select("total createdAt paymentStatus user");

  res.json({
    success: true,
    count: recentOrders.length,
    data: recentOrders
  });
});

/**
 * @desc    Get sales analytics summary
 * @route   GET /api/admin/analytics/summary
 * @access  Private/Admin
 */
export const getSalesSummary = asyncHandler(async (req, res) => {
  const [summary, bestSellers] = await Promise.all([
    // Sales summary
    Order.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" }
        } 
      }
    ]),
    
    // Best selling books
    Order.aggregate([
      { $unwind: "$items" },
      { 
        $group: {
          _id: "$items.book",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      { $unwind: "$bookDetails" }
    ])
  ]);

  res.json({
    success: true,
    data: {
      summary: summary[0] || { 
        totalRevenue: 0, 
        totalOrders: 0, 
        avgOrderValue: 0 
      },
      bestSellers
    }
  });
});

/**
 * @desc    Get inventory status
 * @route   GET /api/admin/analytics/inventory
 * @access  Private/Admin
 */
export const getInventoryStatus = asyncHandler(async (req, res) => {
  const [lowStock, categories] = await Promise.all([
    Book.find({ stock: { $lt: 10 } })
      .sort("stock")
      .limit(10)
      .select("title price stock image"),
    
    Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      lowStock,
      categories
    }
  });
});