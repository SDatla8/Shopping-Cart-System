import { useState } from "react";
import Header from "@/components/Header";
import AIInputSection from "@/components/AIInputSection";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import ShoppingCart from "@/components/ShoppingCart";
import { useCart } from "@/hooks/useCart";
import { ProductFilter } from "@shared/schema";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const { cart } = useCart(sessionId);

  const cartItemCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <AIInputSection sessionId={sessionId} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80">
            <FilterSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>
          
          <main className="flex-1">
            <ProductGrid 
              filters={filters}
              sessionId={sessionId}
            />
          </main>
        </div>
      </div>

      <ShoppingCart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
