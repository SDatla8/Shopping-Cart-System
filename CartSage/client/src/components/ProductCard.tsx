import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, Heart, ExternalLink, ShoppingCart, Check } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
  sessionId: string;
}

export default function ProductCard({ product, sessionId }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart(sessionId);

  const handleAddToCart = async () => {
    if (isAdding || justAdded) return;
    
    setIsAdding(true);
    try {
      await addToCart.mutateAsync({
        sessionId,
        productId: product.id,
        quantity: 1,
      });
      
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const renderStars = (rating: string | null) => {
    if (!rating) return null;
    
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex text-yellow-400 text-sm">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
        {hasHalfStar && <StarHalf size={16} fill="currentColor" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars} size={16} />
        ))}
      </div>
    );
  };

  const getStoreColor = (store: string) => {
    switch (store) {
      case "Amazon": return "text-blue-600 bg-blue-50";
      case "Best Buy": return "text-yellow-600 bg-yellow-50";
      case "Target": return "text-red-600 bg-red-50";
      case "Walmart": return "text-purple-600 bg-purple-50";
      case "Apple": return "text-orange-600 bg-orange-50";
      case "Shein": return "text-black-600 bg-black-50";
      case "Costco": return "text-blue-600 bg-blue-50";
      case "Kohl's": return "text-turqoise-600 bg-turqoise-50";
      case "Dick's Sporting Good's": return "text-green-600 bg-green-50";
      case "Dollar Tree": return "text-pink-600 bg-pink-50";
      case "Lowe's": return "text-violet-600 bg-violet-50";
      case "Burlington": return "text-blue-600 bg-blue-50";
      case "GAP": return "text-blue-600 bg-blue-50";
      case "IKEA": return "text-blue-600 bg-blue-50";
      case "HEB": return "text-blue-600 bg-blue-50";
      case "Home Depot": return "text-blue-600 bg-blue-50";
      
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const savings = product.originalPrice 
    ? parseFloat(product.originalPrice) - parseFloat(product.price)
    : 0;

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden product-card-hover group">
      <div className="relative overflow-hidden">
        <img
          src={imageError ? "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" : product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {product.aiMatchScore && (
          <div className="absolute top-3 left-3 bg-[var(--ai-emerald)] text-white px-2 py-1 rounded-full text-xs font-medium">
            AI Match: {product.aiMatchScore}%
          </div>
        )}
        
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Heart className="text-gray-400 hover:text-red-500 cursor-pointer" size={16} />
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStoreColor(product.store)}`}>
            {product.store}
          </span>
          <div className="flex items-center">
            {renderStars(product.rating)}
            {product.rating && (
              <span className="text-gray-500 text-sm ml-1">({product.rating})</span>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${parseFloat(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-green-600 text-sm font-medium">
              Save ${savings.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || justAdded}
            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              justAdded 
                ? 'bg-green-500 text-white' 
                : 'ai-gradient-hover text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="mr-2" size={16} />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2" size={16} />
                Add to Cart
              </>
            )}
          </Button>
          
          <Button
            onClick={() => window.open(product.productUrl, '_blank')}
            variant="outline"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ExternalLink className="text-gray-600" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
