import { products, cartItems, checklistItems, type Product, type InsertProduct, type CartItem, type InsertCartItem, type ChecklistItem, type InsertChecklistItem, type ProductFilter } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(filter?: ProductFilter): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<Product[]>;
  clearProducts(): Promise<void>;
  
  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Checklist
  getChecklistItems(sessionId: string): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: number, processedText: string, isProcessed: boolean): Promise<ChecklistItem>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private checklistItems: Map<number, ChecklistItem> = new Map();
  private currentProductId = 1;
  private currentCartId = 1;
  private currentChecklistId = 1;

  constructor() {
    // Initialize with sample products from different retailers
    this.initializeSampleProducts();
  }

  private initializeSampleProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "MacBook Pro 14\" M2 Chip - Space Gray",
        description: "High-performance laptop perfect for work, creative projects, and productivity. Features the latest M2 chip technology.",
        price: "1999.00",
        originalPrice: "2199.00",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://amazon.com/macbook-pro-14",
        store: "Amazon",
        category: "Electronics",
        rating: "4.5",
        reviewCount: 2847,
        aiMatchScore: 95,
      },
      {
        name: "Sony WH-1000XM5 Wireless Headphones",
        description: "Industry-leading noise canceling with premium sound quality and 30-hour battery life.",
        price: "349.00",
        originalPrice: "399.00",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://bestbuy.com/sony-headphones",
        store: "Best Buy",
        category: "Electronics",
        rating: "4.8",
        reviewCount: 1523,
        aiMatchScore: 92,
      },
      {
        name: "Vitamix Professional Series 750 Blender",
        description: "Professional-grade blender perfect for smoothies, soups, and food preparation with variable speed control.",
        price: "449.00",
        originalPrice: "529.00",
        imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://target.com/vitamix-blender",
        store: "Target",
        category: "Home & Kitchen",
        rating: "4.2",
        reviewCount: 892,
        aiMatchScore: 88,
      },
      {
        name: "Nike Air Max 270 Running Shoes",
        description: "Lightweight running shoes with Max Air cushioning for comfort and performance during workouts.",
        price: "129.00",
        originalPrice: "150.00",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://walmart.com/nike-air-max",
        store: "Walmart",
        category: "Sports & Outdoors",
        rating: "4.6",
        reviewCount: 3421,
        aiMatchScore: 90,
      },
      {
        name: "iPhone 15 Pro 128GB - Natural Titanium",
        description: "Latest iPhone with titanium design, advanced camera system, and A17 Pro chip for professional performance.",
        price: "999.00",
        originalPrice: "1099.00",
        imageUrl: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://amazon.com/iphone-15-pro",
        store: "Amazon",
        category: "Electronics",
        rating: "4.7",
        reviewCount: 5632,
        aiMatchScore: 85,
      },
      {
        name: "Logitech MX Keys Advanced Wireless Keyboard",
        description: "Premium wireless keyboard with smart illumination and perfect key stability for comfortable typing.",
        price: "89.00",
        originalPrice: "109.00",
        imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://bestbuy.com/logitech-keyboard",
        store: "Best Buy",
        category: "Electronics",
        rating: "4.3",
        reviewCount: 1247,
        aiMatchScore: 82,
      },
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());

    if (filter) {
      if (filter.stores && filter.stores.length > 0) {
        filteredProducts = filteredProducts.filter(p => filter.stores!.includes(p.store));
      }
      if (filter.categories && filter.categories.length > 0) {
        filteredProducts = filteredProducts.filter(p => filter.categories!.includes(p.category));
      }
      if (filter.minPrice) {
        filteredProducts = filteredProducts.filter(p => parseFloat(p.price) >= filter.minPrice!);
      }
      if (filter.maxPrice) {
        filteredProducts = filteredProducts.filter(p => parseFloat(p.price) <= filter.maxPrice!);
      }
      if (filter.minRating) {
        filteredProducts = filteredProducts.filter(p => p.rating && parseFloat(p.rating) >= filter.minRating!);
      }

      // Sort products
      if (filter.sortBy) {
        switch (filter.sortBy) {
          case "price_low":
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case "price_high":
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          case "rating":
            filteredProducts.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
            break;
          case "newest":
            filteredProducts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
            break;
          case "relevance":
          default:
            filteredProducts.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
            break;
        }
      }
    }

    return filteredProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      rating: insertProduct.rating || null,
      originalPrice: insertProduct.originalPrice || null,
      reviewCount: insertProduct.reviewCount || null,
      aiMatchScore: insertProduct.aiMatchScore || null,
      isAvailable: insertProduct.isAvailable ?? true,
    };
    this.products.set(id, product);
    return product;
  }

  async createProducts(products: InsertProduct[]): Promise<Product[]> {
    return Promise.all(products.map(product => this.createProduct(product)));
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId);
    
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId!)!,
    })).filter(item => item.product);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.sessionId === insertItem.sessionId && item.productId === insertItem.productId);

    if (existingItem) {
      return this.updateCartItem(existingItem.id, existingItem.quantity + (insertItem.quantity || 1));
    }

    const id = this.currentCartId++;
    const cartItem: CartItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
      productId: insertItem.productId || null,
      quantity: insertItem.quantity || 1,
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const item = this.cartItems.get(id);
    if (!item) throw new Error("Cart item not found");

    const updatedItem: CartItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToRemove = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToRemove.forEach(id => this.cartItems.delete(id));
  }

  async getChecklistItems(sessionId: string): Promise<ChecklistItem[]> {
    return Array.from(this.checklistItems.values())
      .filter(item => item.sessionId === sessionId);
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const id = this.currentChecklistId++;
    const checklistItem: ChecklistItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
      isProcessed: insertItem.isProcessed ?? false,
    };
    this.checklistItems.set(id, checklistItem);
    return checklistItem;
  }

  async updateChecklistItem(id: number, processedText: string, isProcessed: boolean): Promise<ChecklistItem> {
    const item = this.checklistItems.get(id);
    if (!item) throw new Error("Checklist item not found");

    const updatedItem: ChecklistItem = { ...item, processedText, isProcessed };
    this.checklistItems.set(id, updatedItem);
    return updatedItem;
  }

  async clearProducts(): Promise<void> {
    this.products.clear();
    this.currentProductId = 1;
    
    // Reset to initial sample products
    const sampleProducts = [
      {
        name: "MacBook Pro 14\" M2 Chip - Space Gray",
        description: "Apple MacBook Pro with M2 chip for professional workflows. Features brilliant Liquid Retina XDR display.",
        price: "1999.00",
        originalPrice: "2499.00",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://amazon.com/dp/B0BSHF7LLL",
        store: "Amazon",
        category: "Electronics",
        rating: "4.8",
        reviewCount: 2847,
        aiMatchScore: 95,
      },
      {
        name: "Sony WH-1000XM4 Wireless Headphones",
        description: "Industry-leading noise canceling wireless headphones with 30-hour battery life.",
        price: "279.99",
        originalPrice: "349.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        productUrl: "https://bestbuy.com/site/sony-wh-1000xm4/6408356.p",
        store: "Best Buy",
        category: "Electronics",
        rating: "4.6",
        reviewCount: 15420,
        aiMatchScore: 92,
      }
    ];

    await Promise.all(sampleProducts.map(product => this.createProduct(product)));
  }
}

export const storage = new MemStorage();
