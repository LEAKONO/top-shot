import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for books
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bookstore/books",
    format: async (req, file) => "webp",
    transformation: [
      { width: 800, height: 1200, crop: "limit", quality: "auto" }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `book-${timestamp}`;
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multiple upload for book images
export const uploadBookImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "additionalImages", maxCount: 5 }
]);

// Single upload
export const uploadSingle = upload.single("image");

export { cloudinary };