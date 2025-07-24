import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, ShoppingCart, BarChart3, X, Plus, Minus } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import { ProductFilter } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShoppingPage() {
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { cart: cartItems = [] } = useCart(sessionId);

  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Parse
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Shopping</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation("/analytics")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button className="relative ai-gradient text-white px-6 py-2">
                    <ShoppingCart className="mr-2" size={18} />
                    Cart
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                      {cartItemCount === 0 ? "Your cart is empty" : `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} in your cart`}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No items in cart yet</p>
                        <p className="text-sm">Browse products and add them to your cart</p>
                      </div>
                    ) : (
                      cartItems.map((item: any) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start space-x-4">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.product.store}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-green-600">
                                    ${parseFloat(item.product.price).toFixed(2)}
                                  </span>
                                  {item.product.originalPrice && parseFloat(item.product.originalPrice) > parseFloat(item.product.price) && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${parseFloat(item.product.originalPrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => window.open(item.product.productUrl, '_blank')}
                                >
                                  View Product
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                    
                    {cartItems.length > 0 && (
                      <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">
                            ${cartItems.reduce((total: number, item: any) => 
                              total + (parseFloat(item.product.price) * item.quantity), 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Click "View Product" to purchase items from their respective stores
                        </p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className="lg:w-80">
            <FilterSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>
          
          {/* Products */}
          <main className="flex-1">
            <ProductGrid 
              filters={filters}
              sessionId={sessionId}
            />
          </main>
        </div>
      </div>

      {/* Cart sidebar placeholder - will be implemented */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsCartOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Shopping Cart ({cartItemCount} items)</h2>
            <Button onClick={() => setIsCartOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}