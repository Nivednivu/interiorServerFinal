import express from "express";
import db from "../db.js";

const router = express.Router();

// GET ALL PRODUCTS
router.get("/products", (req, res) => {
  const query = "SELECT * FROM products";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, count: results.length, data: results });
  });
});

// GET SINGLE PRODUCT BY ID
router.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  const query = "SELECT * FROM products WHERE product_id = ?";
  
  db.query(query, [productId], (err, results) => { 
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    res.json({ success: true, data: results[0] });
  });
});

// CREATE NEW PRODUCT - SAFER VERSION
// CREATE NEW PRODUCT - USING AUTO-INCREMENT ID ONLY
router.post("/products", (req, res) => {
  console.log("📨 Received POST /products request");
  console.log("📦 Request body:", req.body);
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: "Request body is missing." 
    });
  }

  const { 
    product_name, 
    price_new, 
    brand, 
    category, 
    description = '', 
    image_url = '', 
    video_url = '' 
  } = req.body;
  
  // Validate required fields
  if (!product_name || !price_new || !brand || !category) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields." 
    });
  }

  // Use only the auto-increment ID, don't insert product_id
  const query = "INSERT INTO products (product_name, price_new, brand, category, description, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    product_name, 
    parseFloat(price_new), 
    brand,  
    category, 
    description, 
    image_url, 
    video_url
  ];

  console.log("🛠️ Executing query with values:", values);

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("❌ Database Error:", err.message);
      return res.status(500).json({ 
        success: false, 
        error: "Database error: " + err.message 
      });
    }
    
    console.log("✅ Product created successfully, ID:", results.insertId);
    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      productId: results.insertId  // This is the auto-generated ID
    });
  });
});
// UPDATE PRODUCT
// UPDATE PRODUCT - FIXED VERSION
router.put("/products/:id", (req, res) => {
  const productId = req.params.id; // This is the auto-increment ID
  const { product_name, price_new, brand, category, description = '', image_url = '', video_url = '' } = req.body;
  
  // Use 'id' instead of 'product_id'
  const checkQuery = "SELECT * FROM products WHERE id = ?";
  
  db.query(checkQuery, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    const updateQuery = `
      UPDATE products 
      SET product_name = ?, price_new = ?, brand = ?, category = ?, description = ?, image_url = ?, video_url = ?
      WHERE id = ?
    `;
    
    db.query(updateQuery, [product_name, parseFloat(price_new), brand, category, description, image_url, video_url, productId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.json({ 
        success: true, 
        message: "Product updated successfully" 
      });
    });
  });
});

// DELETE PRODUCT - FIXED VERSION
router.delete("/products/:id", (req, res) => {
  const productId = req.params.id; // This is the auto-increment ID
  
  // Use 'id' instead of 'product_id'
  const checkQuery = "SELECT * FROM products WHERE id = ?";
  
  db.query(checkQuery, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    const deleteQuery = "DELETE FROM products WHERE id = ?";
    
    db.query(deleteQuery, [productId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.json({ 
        success: true, 
        message: "Product deleted successfully" 
      }); 
    });
  });
});

// DELETE PRODUCT
// DELETE THIS DUPLICATE ROUTE (the one using product_id):
router.delete("/products/:id", (req, res) => {
  const productId = req.params.id;
  
  const checkQuery = "SELECT * FROM products WHERE product_id = ?";
  
  db.query(checkQuery, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    const deleteQuery = "DELETE FROM products WHERE product_id = ?";
    
    db.query(deleteQuery, [productId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.json({ 
        success: true, 
        message: "Product deleted successfully" 
      });
    });
  });
});

export default router; 