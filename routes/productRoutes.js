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

// CREATE NEW PRODUCT
router.post("/products", (req, res) => {
  const { productId, product_name, price_new, brand, category, description, image_url, video_url } = req.body;
  
  if (!product_name || !price_new || !brand || !category) {
    return res.status(400).json({ 
      success: false, 
      error: "Product name, price, brand, and category are required" 
    });
  }

  let query, values;

  if (productId) {
    query = "INSERT INTO products (product_id, product_name, price_new, brand, category, description, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    values = [productId, product_name, price_new, brand, category, description, image_url, video_url];
  } else {
    query = "INSERT INTO products (product_name, price_new, brand, category, description, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    values = [product_name, price_new, brand, category, description, image_url, video_url];
  }

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    const insertedId = productId || results.insertId;
    
    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      productId: insertedId
    });
  });
});

// UPDATE PRODUCT
router.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const { product_name, price_new, brand, category, description, image_url, video_url } = req.body;
  
  const checkQuery = "SELECT * FROM products WHERE product_id = ?";
  
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
      WHERE product_id = ?
    `;
    
    db.query(updateQuery, [product_name, price_new, brand, category, description, image_url, video_url, productId], (err, results) => {
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

// DELETE PRODUCT
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