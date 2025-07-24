import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Brain, Lightbulb } from "lucide-react";
import { ProductFilter } from "@shared/schema";

interface FilterSidebarProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
}

const STORES = [
  { id: "Amazon", name: "Amazon", count: 24 },
  { id: "Best Buy", name: "Best Buy", count: 18 },
  { id: "Target", name: "Target", count: 12 },
  { id: "Walmart", name: "Walmart", count: 15 },
];

const CATEGORIES = [
  { id: "Electronics", name: "Electronics" },
  { id: "Home & Kitchen", name: "Home & Kitchen" },
  { id: "Sports & Outdoors", name: "Sports & Outdoors" },
  { id: "Clothing", name: "Clothing" },
];

export default function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleStoreChange = (storeId: string, checked: boolean) => {
    const currentStores = filters.stores || [];
    const newStores = checked
      ? [...currentStores, storeId]
      : currentStores.filter(s => s !== storeId);
    
    onFiltersChange({ ...filters, stores: newStores });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(c => c !== categoryId);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = () => {
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    onFiltersChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    onFiltersChange({});
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Filter className="mr-2 text-[var(--ai-purple)]" size={20} />
        Smart Filters
      </h3>

      {/* Store Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Retailers</h4>
        <div className="space-y-2">
          {STORES.map((store) => (
            <div key={store.id} className="flex items-center justify-between">
              <label className="flex items-center">
                <Checkbox
                  checked={filters.stores?.includes(store.id) || false}
                  onCheckedChange={(checked) => handleStoreChange(store.id, checked as boolean)}
                  className="rounded border-gray-300 text-[var(--ai-purple)] focus:ring-[var(--ai-purple)]"
                />
                <span className="ml-3 text-sm text-gray-600">{store.name}</span>
              </label>
              <span className="text-xs text-gray-400">({store.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceChange}
              className="w-full px-3 py-2 text-sm"
            />
            <span className="text-gray-400">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceChange}
              className="w-full px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category.id} className="flex items-center">
              <Checkbox
                checked={filters.categories?.includes(category.id) || false}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                className="rounded border-gray-300 text-[var(--ai-purple)] focus:ring-[var(--ai-purple)]"
              />
              <span className="ml-3 text-sm text-gray-600">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <Brain className="mr-2 text-[var(--ai-purple)]" size={16} />
          AI Insights
        </h4>
        <Card className="ai-gradient bg-opacity-10 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Best value matches found:</p>
          <div className="space-y-1">
            <div className="text-xs text-[var(--ai-purple)] flex items-center">
              <Lightbulb className="mr-1" size={12} />
              15% savings on electronics
            </div>
            <div className="text-xs text-[var(--ai-purple)] flex items-center">
              <Lightbulb className="mr-1" size={12} />
              Free shipping available
            </div>
            <div className="text-xs text-[var(--ai-purple)] flex items-center">
              <Lightbulb className="mr-1" size={12} />
              3 bundle deals detected
            </div>
          </div>
        </Card>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="ghost"
        className="w-full text-center text-[var(--ai-purple)] hover:text-[var(--ai-indigo)] transition-colors duration-200 text-sm font-medium"
      >
        Clear All Filters
      </Button>
    </Card>
  );
}
