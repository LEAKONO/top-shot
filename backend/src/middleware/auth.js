import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "./async.js"; // Add this import
import { AuthError } from "../errors/index.js";
import rateLimit from "express-rate-limit"; // Add this import if using rateLimiter

/**
 * @desc    Protect routes with JWT authentication
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AuthError("Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new AuthError("User belonging to this token no longer exists");
    }

    req.user = user;
    next();
  } catch (err) {
    throw new AuthError("Not authorized, token failed");
  }
});

/**
 * @desc    Restrict route to admin users
 */
export const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new AuthError("Not authorized as admin");
  }
  next();
};

/**
 * @desc    Rate limiter for API endpoints
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});