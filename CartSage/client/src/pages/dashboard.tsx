import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingUp, Package, Users, Brain, Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

export default function Dashboard() {
  const { data: products } = useProducts();

  const stats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Categories",
      value: new Set(products?.map(p => p.category)).size || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Retailers",
      value: new Set(products?.map(p => p.store)).size || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "AI Processed",
      value: products?.filter(p => p.aiMatchScore && p.aiMatchScore > 85).length || 0,
      icon: Brain,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  const recentProducts = products?.slice(0, 5) || [];
  const topCategories = products?.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your AI shopping assistant performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Categories Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          <div className="space-y-3">
            {Object.entries(topCategories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="ai-gradient h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(topCategories))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="mr-2 text-[var(--ai-purple)]" size={20} />
            AI Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 ai-gradient bg-opacity-10 rounded-lg">
              <div className="flex items-center mb-2">
                <Zap className="mr-2 text-[var(--ai-purple)]" size={16} />
                <span className="font-medium text-gray-900">Smart Recommendations</span>
              </div>
              <p className="text-sm text-gray-600">
                AI has processed {products?.length || 0} products with an average match score of{' '}
                {products?.length ? Math.round(products.reduce((acc, p) => acc + (p.aiMatchScore || 0), 0) / products.length) : 0}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="mr-2 text-green-600" size={16} />
                <span className="font-medium text-gray-900">Cost Savings</span>
              </div>
              <p className="text-sm text-gray-600">
                Identified potential savings on {products?.filter(p => p.originalPrice && parseFloat(p.originalPrice) > parseFloat(p.price)).length || 0} products
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Products */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Products</h3>
        <div className="space-y-3">
          {recentProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.store} • {product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
                {product.aiMatchScore && (
                  <p className="text-sm text-[var(--ai-purple)]">AI: {product.aiMatchScore}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}