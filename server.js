import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// FIXED MIDDLEWARE ORDER - This is the main issue!
app.use(express.json({ limit: '50mb' })); // MUST come first
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📦 Body:', req.body);
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api", productRoutes);
app.use("/api", uploadRoutes);

// Test route to check if JSON parsing works
app.post("/api/test-json", (req, res) => {
  console.log("✅ JSON test - Request body:", req.body);
  res.json({ 
    success: true, 
    message: "JSON parsing is working!",
    receivedData: req.body 
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Uploads URL: http://localhost:${PORT}/uploads/`);
});