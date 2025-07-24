import { Bot, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return location.startsWith(path) && path !== "/";
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 ai-gradient rounded-xl flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Cart</h1>
                <p className="text-xs text-gray-500">Smart Shopping Assistant</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard">
              <span className={`cursor-pointer transition-colors duration-200 ${
                isActive("/dashboard") 
                  ? "text-[var(--ai-purple)] font-medium" 
                  : "text-gray-700 hover:text-[var(--ai-purple)]"
              }`}>
                Dashboard
              </span>
            </Link>
            <Link href="/products">
              <span className={`cursor-pointer transition-colors duration-200 ${
                isActive("/products") 
                  ? "text-[var(--ai-purple)] font-medium" 
                  : "text-gray-700 hover:text-[var(--ai-purple)]"
              }`}>
                Products
              </span>
            </Link>
            <Link href="/analytics">
              <span className={`cursor-pointer transition-colors duration-200 ${
                isActive("/analytics") 
                  ? "text-[var(--ai-purple)] font-medium" 
                  : "text-gray-700 hover:text-[var(--ai-purple)]"
              }`}>
                Analytics
              </span>
            </Link>
          </nav>

          {/* Cart Button */}
          <Button 
            onClick={onCartClick}
            className="relative ai-gradient-hover text-white px-6 py-2 rounded-lg"
          >
            <ShoppingCart className="mr-2" size={18} />
            Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
