import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Minimal middleware
app.use(express.json());

// Only health route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Simple server working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
});