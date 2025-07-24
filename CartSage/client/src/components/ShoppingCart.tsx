import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Minus, ShoppingCart as CartIcon, CreditCard, Lightbulb, Brain } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function ShoppingCart({ isOpen, onClose, sessionId }: ShoppingCartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart(sessionId);

  const subtotal = cart?.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0) || 0;
  const savings = cart?.reduce((total, item) => {
    const originalPrice = item.product.originalPrice ? parseFloat(item.product.originalPrice) : parseFloat(item.product.price);
    const currentPrice = parseFloat(item.product.price);
    return total + ((originalPrice - currentPrice) * item.quantity);
  }, 0) || 0;
  const total = subtotal;

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart.mutateAsync(itemId);
    } else {
      updateQuantity.mutateAsync({ id: itemId, quantity: newQuantity });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 ai-gradient text-white">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {!cart || cart.length === 0 ? (
              <div className="text-center py-12">
                <CartIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="p-4 bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">{item.product.store}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-gray-900">
                            ${parseFloat(item.product.price).toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* AI Recommendations in Cart */}
            {cart && cart.length > 0 && (
              <Card className="mt-6 p-4 ai-gradient bg-opacity-10">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Brain className="mr-2 text-[var(--ai-purple)]" size={16} />
                  AI Suggestions
                </h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 flex items-center">
                    <Lightbulb className="mr-1 text-[var(--ai-purple)]" size={12} />
                    Add laptop sleeve for protection
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Lightbulb className="mr-1 text-[var(--ai-purple)]" size={12} />
                    Bundle deals: Save 15%
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Lightbulb className="mr-1 text-[var(--ai-purple)]" size={12} />
                    Free shipping on orders over $2,000
                  </div>
                </div>
              </Card>
            )}
          </ScrollArea>

          {/* Cart Footer */}
          {cart && cart.length > 0 && (
            <Card className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AI Savings:</span>
                    <span className="font-medium text-green-600">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full ai-gradient-hover text-white py-3 font-semibold">
                  <CreditCard className="mr-2" size={18} />
                  Proceed to Checkout
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline" 
                  className="w-full py-3 font-medium"
                >
                  Continue Shopping  
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
