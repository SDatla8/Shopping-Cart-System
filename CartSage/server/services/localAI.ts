import { InsertProduct } from "@shared/schema";

// Accurate product image mapping
function getImageForProduct(itemName: string): string {
  const itemLower = itemName.toLowerCase();
  
  if (itemLower.includes('laptop') || itemLower.includes('macbook') || itemLower.includes('computer')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('headphone') || itemLower.includes('earphone') || itemLower.includes('earbuds')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('phone') || itemLower.includes('iphone') || itemLower.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('keyboard')) {
    return 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('blender')) {
    return 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('coffee') && (itemLower.includes('maker') || itemLower.includes('machine'))) {
    return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('vacuum')) {
    return 'https://images.unsplash.com/photo-1558618666-fbd3c4b5101a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('shoe') || itemLower.includes('sneaker') || itemLower.includes('running')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  if (itemLower.includes('shirt') || itemLower.includes('clothes') || itemLower.includes('clothing')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
}

// Generate working product URLs - alternative approach using DuckDuckGo search
function getProductUrl(store: string, itemName: string): string {
  const searchQuery = encodeURIComponent(`${itemName} site:${store.toLowerCase().replace(' ', '')}.com`);
  return `https://duckduckgo.com/?q=${searchQuery}&ia=web`;
}

export interface AIProcessedItem {
  originalText: string;
  processedText: string;
  category: string;
  keywords: string[];
  searchTerms: string[];
}

// Built-in AI simulation for processing checklists without external APIs
export async function processChecklistWithLocalAI(checklistText: string): Promise<AIProcessedItem[]> {
  const items = extractItemsFromText(checklistText);
  
  return items.map(item => {
    const processed = processItem(item);
    return {
      originalText: item,
      processedText: processed.name,
      category: processed.category,
      keywords: processed.keywords,
      searchTerms: processed.searchTerms,
    };
  });
}

function extractItemsFromText(text: string): string[] {
  // Remove common filler words and split into items
  const fillerWords = ['need', 'want', 'buy', 'get', 'purchase', 'looking for', 'i need', 'i want', 'shopping for'];
  let cleanedText = text.toLowerCase();
  
  fillerWords.forEach(filler => {
    cleanedText = cleanedText.replace(new RegExp(filler, 'g'), '');
  });
  
  // Split by common delimiters
  const items = cleanedText
    .split(/[,;\n\r\-\*•]/)
    .map(item => item.trim())
    .filter(item => item.length > 2)
    .map(item => item.replace(/^\d+\.?\s*/, '')) // Remove numbering
    .filter(item => item.length > 0);
  
  return items;
}

function processItem(item: string): { name: string; category: string; keywords: string[]; searchTerms: string[] } {
  const itemLower = item.toLowerCase();
  
  // Electronics detection
  if (itemLower.includes('laptop') || itemLower.includes('computer') || itemLower.includes('macbook')) {
    return {
      name: item.includes('macbook') || item.includes('MacBook') ? 'MacBook Pro' : 'Laptop',
      category: 'Electronics',
      keywords: ['laptop', 'computer', 'work', 'productivity'],
      searchTerms: ['laptop computer', 'macbook pro', 'business laptop']
    };
  }
  
  if (itemLower.includes('headphone') || itemLower.includes('earphone') || itemLower.includes('earbuds')) {
    return {
      name: 'Wireless Headphones',
      category: 'Electronics',
      keywords: ['headphones', 'wireless', 'bluetooth', 'audio'],
      searchTerms: ['wireless headphones', 'bluetooth headphones', 'noise canceling']
    };
  }
  
  if (itemLower.includes('phone') || itemLower.includes('iphone') || itemLower.includes('smartphone')) {
    return {
      name: item.includes('iphone') || item.includes('iPhone') ? 'iPhone' : 'Smartphone',
      category: 'Electronics',
      keywords: ['phone', 'smartphone', 'mobile', 'cellular'],
      searchTerms: ['smartphone', 'iphone', 'android phone']
    };
  }
  
  if (itemLower.includes('keyboard') || itemLower.includes('mouse')) {
    return {
      name: itemLower.includes('keyboard') ? 'Wireless Keyboard' : 'Wireless Mouse',
      category: 'Electronics',
      keywords: ['computer', 'peripheral', 'wireless', 'productivity'],
      searchTerms: ['wireless keyboard', 'computer mouse', 'office accessories']
    };
  }
  
  // Kitchen & Home detection
  if (itemLower.includes('blender') || itemLower.includes('mixer')) {
    return {
      name: 'Kitchen Blender',
      category: 'Home & Kitchen',
      keywords: ['blender', 'kitchen', 'smoothie', 'cooking'],
      searchTerms: ['kitchen blender', 'smoothie maker', 'food processor']
    };
  }
  
  if (itemLower.includes('coffee') && (itemLower.includes('maker') || itemLower.includes('machine'))) {
    return {
      name: 'Coffee Maker',
      category: 'Home & Kitchen',
      keywords: ['coffee', 'brewing', 'kitchen', 'appliance'],
      searchTerms: ['coffee maker', 'coffee machine', 'drip coffee']
    };
  }
  
  if (itemLower.includes('vacuum') || itemLower.includes('cleaner')) {
    return {
      name: 'Vacuum Cleaner',
      category: 'Home & Kitchen',
      keywords: ['vacuum', 'cleaning', 'home', 'appliance'],
      searchTerms: ['vacuum cleaner', 'home cleaning', 'floor cleaner']
    };
  }
  
  // Sports & Outdoors
  if (itemLower.includes('shoe') || itemLower.includes('sneaker') || itemLower.includes('running')) {
    return {
      name: 'Running Shoes',
      category: 'Sports & Outdoors',
      keywords: ['shoes', 'running', 'athletic', 'fitness'],
      searchTerms: ['running shoes', 'athletic shoes', 'sneakers']
    };
  }
  
  // Clothing
  if (itemLower.includes('shirt') || itemLower.includes('clothes') || itemLower.includes('clothing')) {
    return {
      name: 'Clothing',
      category: 'Clothing',
      keywords: ['clothing', 'apparel', 'fashion', 'wear'],
      searchTerms: ['clothing', 'shirts', 'apparel']
    };
  }
  
  // Food items
  if (itemLower.includes('milk') || itemLower.includes('bread') || itemLower.includes('eggs') || 
      itemLower.includes('food') || itemLower.includes('grocery')) {
    return {
      name: item,
      category: 'Grocery',
      keywords: ['food', 'grocery', 'kitchen', 'cooking'],
      searchTerms: [item, 'grocery', 'food items']
    };
  }
  
  // Default fallback
  return {
    name: item,
    category: 'General',
    keywords: [item],
    searchTerms: [item]
  };
}

export async function generateProductRecommendationsLocal(processedItems: AIProcessedItem[]): Promise<InsertProduct[]> {
  const products: InsertProduct[] = [];
  
  for (const item of processedItems) {
    const categoryProducts = generateProductsForCategory(item);
    products.push(...categoryProducts);
  }
  
  return products;
}

function generateProductsForCategory(item: AIProcessedItem): InsertProduct[] {
  const stores = ['Amazon', 'Best Buy', 'Target', 'Walmart'];
  const products: InsertProduct[] = [];
  
  // Generate 2-3 products per item across different stores
  const productTemplates = getProductTemplatesForCategory(item.category, item.processedText);
  
  productTemplates.forEach((template, index) => {
    const store = stores[index % stores.length];
    const basePrice = template.basePrice;
    const discount = Math.random() * 0.3; // Up to 30% discount
    const finalPrice = basePrice * (1 - discount);
    
    products.push({
      name: template.name,
      description: template.description,
      price: finalPrice.toFixed(2),
      originalPrice: basePrice.toFixed(2),
      imageUrl: template.imageUrl,
      productUrl: getProductUrl(store, template.name),
      store: store,
      category: item.category,
      rating: (4.0 + Math.random() * 1.0).toFixed(1), // 4.0-5.0 rating
      reviewCount: Math.floor(Math.random() * 5000) + 500,
      aiMatchScore: Math.floor(85 + Math.random() * 13), // 85-98% match
      isAvailable: true,
    });
  });
  
  return products;
}

function getProductTemplatesForCategory(category: string, itemName: string) {
  const templates = {
    'Electronics': [
      {
        name: `${itemName} - Premium Model`,
        description: `High-performance ${itemName.toLowerCase()} with advanced features and excellent build quality. Perfect for work and entertainment.`,
        basePrice: Math.random() * 800 + 200,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-')
      },
      {
        name: `${itemName} - Professional Edition`,
        description: `Professional-grade ${itemName.toLowerCase()} designed for productivity and performance. Industry-leading specifications.`,
        basePrice: Math.random() * 600 + 300,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-') + '-pro'
      }
    ],
    'Home & Kitchen': [
      {
        name: `${itemName} - Deluxe Series`,
        description: `Premium ${itemName.toLowerCase()} with multiple settings and durable construction. Perfect for daily use in your kitchen.`,
        basePrice: Math.random() * 300 + 100,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-')
      },
      {
        name: `${itemName} - Commercial Grade`,
        description: `Heavy-duty ${itemName.toLowerCase()} built for frequent use. Restaurant-quality performance for your home.`,
        basePrice: Math.random() * 400 + 150,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-') + '-commercial'
      }
    ],
    'Sports & Outdoors': [
      {
        name: `${itemName} - Athletic Performance`,
        description: `High-performance ${itemName.toLowerCase()} designed for athletes and fitness enthusiasts. Superior comfort and durability.`,
        basePrice: Math.random() * 200 + 50,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-')
      }
    ],
    'Clothing': [
      {
        name: `${itemName} - Premium Collection`,
        description: `Stylish and comfortable ${itemName.toLowerCase()} made from high-quality materials. Perfect for any occasion.`,
        basePrice: Math.random() * 100 + 25,
        imageUrl: getImageForProduct(itemName),
        slug: itemName.toLowerCase().replace(/\s+/g, '-')
      }
    ]
  };
  
  return templates[category as keyof typeof templates] || [
    {
      name: itemName,
      description: `Quality ${itemName.toLowerCase()} with great value and reliability. Highly rated by customers.`,
      basePrice: Math.random() * 150 + 25,
      imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      slug: itemName.toLowerCase().replace(/\s+/g, '-')
    }
  ];
}