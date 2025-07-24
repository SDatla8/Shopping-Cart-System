import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, DollarSign, TrendingUp, Target, BarChart, PieChart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useLocation } from "wouter";

export default function AnalyticsPage() {
  const { data: products } = useProducts();
  const [location, setLocation] = useLocation();

  const analytics = {
    totalProducts: products?.length || 0,
    avgPrice: products?.length ? 
      products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length : 0,
    totalSavings: products?.reduce((sum, p) => {
      const original = parseFloat(p.originalPrice || p.price);
      const current = parseFloat(p.price);
      return sum + (original - current);
    }, 0) || 0,
    avgRating: products?.length ?
      products.filter(p => p.rating).reduce((sum, p) => sum + parseFloat(p.rating!), 0) / 
      products.filter(p => p.rating).length : 0
  };

  const storeDistribution = products?.reduce((acc, product) => {
    acc[product.store] = (acc[product.store] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryData = products?.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const priceRanges = {
    'Under $50': products?.filter(p => parseFloat(p.price) < 50).length || 0,
    '$50-$200': products?.filter(p => parseFloat(p.price) >= 50 && parseFloat(p.price) < 200).length || 0,
    '$200-$500': products?.filter(p => parseFloat(p.price) >= 200 && parseFloat(p.price) < 500).length || 0,
    'Over $500': products?.filter(p => parseFloat(p.price) >= 500).length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation("/shopping")}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shopping
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 mr-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.avgPrice.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 mr-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.totalSavings.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-50 mr-4">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Store Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="mr-2 text-[var(--ai-purple)]" size={20} />
              Store Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(storeDistribution).map(([store, count]) => (
                <div key={store} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{store}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="ai-gradient h-3 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(storeDistribution))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="mr-2 text-[var(--ai-purple)]" size={20} />
              Category Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(categoryData).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-gradient-to-r from-[var(--ai-emerald)] to-[var(--ai-indigo)] h-3 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(categoryData))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Price Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range Distribution</h3>
            <div className="space-y-4">
              {Object.entries(priceRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{range}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-gradient-to-r from-[var(--ai-amber)] to-[var(--ai-purple)] h-3 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(priceRanges))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance</h3>
            <div className="space-y-4">
              <div className="p-4 ai-gradient bg-opacity-10 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Match Score Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>90-100% Match</span>
                    <span>{products?.filter(p => p.aiMatchScore && p.aiMatchScore >= 90).length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>80-89% Match</span>
                    <span>{products?.filter(p => p.aiMatchScore && p.aiMatchScore >= 80 && p.aiMatchScore < 90).length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Below 80% Match</span>
                    <span>{products?.filter(p => p.aiMatchScore && p.aiMatchScore < 80).length || 0}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Accuracy Stats</h4>
                <p className="text-sm text-gray-600">
                  Average AI confidence: {products?.length ? 
                    Math.round(products.reduce((acc, p) => acc + (p.aiMatchScore || 0), 0) / products.length) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}