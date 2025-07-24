import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { ProductFilter } from "@shared/schema";

interface ProductGridProps {
  filters: ProductFilter;
  sessionId: string;
}

export default function ProductGrid({ filters, sessionId }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ProductFilter['sortBy']>("relevance");
  
  const { data: products, isLoading, error } = useProducts({
    ...filters,
    sortBy,
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSortChange = (value: string) => {
    setSortBy(value as ProductFilter['sortBy']);
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading products</div>
        <p className="text-gray-600">{error.message}</p>
      </Card>
    );
  }

  return (
    <div>
      {/* Search and Sort Bar */}
      <Card className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search within results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{filteredProducts.length} products found</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="loading-shimmer h-48 w-full"></div>
              <div className="p-5">
                <div className="loading-shimmer h-4 w-3/4 mb-2 rounded"></div>
                <div className="loading-shimmer h-3 w-full mb-2 rounded"></div>
                <div className="loading-shimmer h-3 w-2/3 mb-4 rounded"></div>
                <div className="loading-shimmer h-10 w-full rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms, or process a new checklist with AI.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sessionId={sessionId}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredProducts.length > 0 && (
        <div className="text-center mt-12">
          <Button className="ai-gradient-hover text-white px-8 py-3 rounded-lg">
            <Loader2 className="mr-2" size={18} />
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
