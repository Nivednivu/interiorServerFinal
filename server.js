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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory - FIXED FOR RENDER
// Serve static files from uploads directory - IMPROVED VERSION
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set proper CORS headers for files
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Add CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-react-app.onrender.com'],
  credentials: true
}));
// Logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('📋 Content-Type:', req.headers['content-type']);
  next();
});

// Routes
app.use("/api", productRoutes);
app.use("/api", uploadRoutes);

// Test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/api/test-uploads", (req, res) => {
  res.json({ 
    message: "Uploads test",
    uploadsDir: uploadsDir,
    exists: fs.existsSync(uploadsDir),
    files: fs.readdirSync(uploadsDir)
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Uploads URL: /uploads/`);
});
