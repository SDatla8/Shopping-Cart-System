import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { processChecklistWithLocalAI, generateProductRecommendationsLocal } from "./services/localAI";
import { extractTextFromDocument } from "./services/pdfParser";
import { freeApiService } from "./services/freeApiService";
import { filterSchema, aiProcessRequestSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get products with filtering
  app.get("/api/products", async (req, res) => {
    try {
      // Parse query parameters properly for arrays
      const parseQuery = (query: any) => {
        const parsed: any = {};
        
        if (query.stores) {
          parsed.stores = Array.isArray(query.stores) ? query.stores : [query.stores];
        }
        if (query.categories) {
          parsed.categories = Array.isArray(query.categories) ? query.categories : [query.categories];
        }
        if (query.minPrice) {
          parsed.minPrice = parseFloat(query.minPrice);
        }
        if (query.maxPrice) {
          parsed.maxPrice = parseFloat(query.maxPrice);
        }
        if (query.minRating) {
          parsed.minRating = parseFloat(query.minRating);
        }
        if (query.sortBy) {
          parsed.sortBy = query.sortBy;
        }
        
        return parsed;
      };

      const filter = filterSchema.parse(parseQuery(req.query));
      const products = await storage.getProducts(filter);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(400).json({ message: "Invalid filter parameters" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Process checklist text with AI
  app.post("/api/ai/process-checklist", async (req, res) => {
    try {
      const { text, sessionId } = aiProcessRequestSchema.parse(req.body);
      
      // Auto-reset: Clear existing products when processing new input
      await storage.clearProducts();
      
      // Save original checklist
      await storage.createChecklistItem({
        sessionId,
        originalText: text,
        processedText: "",
        isProcessed: false,
      });

      // Process with AI
      const processedItems = await processChecklistWithLocalAI(text);
      
      // Use improved free API service for better product links
      const newProducts = freeApiService.findProducts(processedItems);
      
      // Add new products to storage
      const createdProducts = await storage.createProducts(newProducts);
      
      res.json({
        processedItems,
        products: createdProducts,
        message: `Found ${createdProducts.length} product recommendations with working links`
      });

    } catch (error) {
      console.error("Error processing checklist:", error);
      res.status(500).json({ 
        message: "Failed to process checklist with AI", 
        error: (error as Error).message 
      });
    }
  });

  // Upload and process document
  app.post("/api/ai/process-document", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const sessionId = req.body.sessionId;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      // Extract text from document
      const extractedText = await extractTextFromDocument(req.file.buffer, req.file.mimetype);
      
      if (!extractedText.trim()) {
        return res.status(400).json({ message: "No text found in document" });
      }

      // Save original checklist
      await storage.createChecklistItem({
        sessionId,
        originalText: extractedText,
        processedText: "",
        isProcessed: false,
      });

      // Auto-reset: Clear existing products when processing new input
      await storage.clearProducts();
      
      // Process with AI
      const processedItems = await processChecklistWithLocalAI(extractedText);
      
      // Use improved free API service for better product links
      const newProducts = freeApiService.findProducts(processedItems);
      
      // Add new products to storage
      const createdProducts = await storage.createProducts(newProducts);

      res.json({
        extractedText,
        processedItems,
        products: createdProducts,
        message: `Extracted text from ${req.file.originalname} and found ${createdProducts.length} product recommendations`
      });

    } catch (error) {
      console.error("Error processing document:", error);
      res.status(500).json({ 
        message: "Failed to process document", 
        error: (error as Error).message 
      });
    }
  });

  // Reset products route
  app.post("/api/products/reset", async (req, res) => {
    try {
      await storage.clearProducts();
      res.json({ message: "Products reset successfully" });
    } catch (error) {
      console.error("Error resetting products:", error);
      res.status(500).json({ error: "Failed to reset products" });
    }
  });

  // Cart routes
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItem = insertCartItemSchema.parse(req.body);
      const newItem = await storage.addToCart(cartItem);
      res.json(newItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (quantity <= 0) {
        await storage.removeFromCart(id);
        res.json({ message: "Item removed from cart" });
      } else {
        const updatedItem = await storage.updateCartItem(id, quantity);
        res.json(updatedItem);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
