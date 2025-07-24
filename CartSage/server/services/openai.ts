import OpenAI from "openai";
import { InsertProduct } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIProcessedItem {
  originalText: string;
  processedText: string;
  category: string;
  keywords: string[];
  searchTerms: string[];
}

export async function processChecklistWithAI(checklistText: string): Promise<AIProcessedItem[]> {
  try {
    const prompt = `
You are an AI shopping assistant. Analyze the following checklist text and extract individual shopping items. For each item, provide:
1. The original text
2. A cleaned, processed version (removing filler words like "need", "want", "buy", etc.)
3. The most appropriate product category
4. Relevant keywords for product search
5. Specific search terms that would work well with online retailers

Remove filler words and focus on the actual products needed. If someone says "I need a laptop for work", extract "laptop" and add keywords like "business", "productivity", "professional".

Checklist text: "${checklistText}"

Respond with a JSON object containing an array of items with the structure:
{
  "items": [
    {
      "originalText": "string",
      "processedText": "string", 
      "category": "string",
      "keywords": ["string"],
      "searchTerms": ["string"]
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful shopping assistant that processes checklists and extracts product information. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.items || [];

  } catch (error) {
    console.error("Error processing checklist with AI:", error);
    throw new Error("Failed to process checklist with AI: " + (error as Error).message);
  }
}

export async function generateProductRecommendations(processedItems: AIProcessedItem[]): Promise<InsertProduct[]> {
  try {
    const itemsText = processedItems.map(item => 
      `${item.processedText} (${item.keywords.join(', ')})`
    ).join('; ');

    const prompt = `
Based on these processed shopping items: "${itemsText}"

Generate realistic product recommendations that would be available at Amazon, Best Buy, Target, and Walmart. For each item, create 1-2 product recommendations with:

1. Realistic product names
2. Detailed descriptions
3. Appropriate pricing (research typical market prices)
4. Proper categorization
5. Stock photo URLs from Unsplash that match the product
6. Realistic retailer URLs (can be example URLs)
7. AI match scores (85-98 range)
8. Realistic ratings and review counts

Make sure the products are diverse across different retailers and categories.

Respond with JSON:
{
  "products": [
    {
      "name": "string",
      "description": "string",
      "price": "decimal_string",
      "originalPrice": "decimal_string", 
      "imageUrl": "unsplash_url",
      "productUrl": "retailer_url",
      "store": "Amazon|Best Buy|Target|Walmart",
      "category": "string",
      "rating": "decimal_string",
      "reviewCount": number,
      "aiMatchScore": number
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an expert product researcher who creates realistic product recommendations based on shopping needs. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.products || [];

  } catch (error) {
    console.error("Error generating product recommendations:", error);
    throw new Error("Failed to generate product recommendations: " + (error as Error).message);
  }
}
