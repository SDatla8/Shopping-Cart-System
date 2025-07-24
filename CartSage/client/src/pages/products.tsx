import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import { ProductFilter } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetProductsMutation = useMutation({
    mutationFn: async () => {
      // Clear the current session data and reset to initial products
      const response = await fetch('/api/products/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (!response.ok) throw new Error('Failed to reset products');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Products Reset",
        description: "Product catalog has been reset to default items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reset products: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Browse and filter AI-recommended products</p>
        </div>
        <Button
          onClick={() => resetProductsMutation.mutate()}
          disabled={resetProductsMutation.isPending}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RotateCcw className={`w-4 h-4 ${resetProductsMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Reset Products</span>
        </Button>
      </div>

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
  );
}