import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bot, FileText, List, ArrowRight, Upload, RotateCcw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ParseChecklistPage() {
  const [text, setText] = useState("");
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processTextMutation = useMutation({
    mutationFn: async (inputText: string) => {
      const response = await fetch("/api/ai/process-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, sessionId }),
      });
      if (!response.ok) throw new Error("Failed to process checklist");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Checklist Processed!",
        description: `Found ${data.products.length} product recommendations`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/shopping");
    },
    onError: (error) => {
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processDocumentMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("document", uploadFile);
      formData.append("sessionId", sessionId);

      const response = await fetch("/api/ai/process-document", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to process document");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Processed!",
        description: `Found ${data.products.length} product recommendations`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/shopping");
    },
    onError: (error) => {
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetProductsMutation = useMutation({
    mutationFn: async () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      processTextMutation.mutate(text.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      processDocumentMutation.mutate(uploadedFile);
    }
  };

  const isProcessing = processTextMutation.isPending || processDocumentMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--ai-purple)] via-[var(--ai-indigo)] to-[var(--ai-emerald)]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Shopping Assistant</h1>
                <p className="text-xs text-white/80">Parse your shopping lists</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => resetProductsMutation.mutate()}
                disabled={resetProductsMutation.isPending}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className={`w-4 h-4 mr-2 ${resetProductsMutation.isPending ? 'animate-spin' : ''}`} />
                Reset
              </Button>
              
              <Button
                onClick={() => setLocation("/shopping")}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                View Products
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Transform Your Shopping Lists
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Input your checklist and let AI find the best products from major retailers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text Input */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <List className="mr-2 text-[var(--ai-purple)]" size={20} />
                Text Input
              </CardTitle>
              <CardDescription>
                Type or paste your shopping checklist below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="checklist" className="text-sm font-medium text-gray-700">
                    Shopping Checklist
                  </Label>
                  <Textarea
                    id="checklist"
                    placeholder="Enter your shopping list here... 
Example: laptop for work, wireless headphones, kitchen blender, running shoes"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] mt-2"
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!text.trim() || isProcessing}
                  className="w-full ai-gradient text-white font-semibold py-3"
                >
                  {processTextMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <ArrowRight className="mr-2" size={18} />
                      Parse Checklist
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <FileText className="mr-2 text-[var(--ai-purple)]" size={20} />
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload a PDF or text file containing your shopping list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">
                    Choose File
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                
                {file && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="mr-2 text-[var(--ai-purple)]" size={16} />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">
                    {processDocumentMutation.isPending ? "Processing document..." : "Drag and drop your file here"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, TXT, DOC, DOCX files
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-white/80">Smart processing extracts products from any text format</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Retailer</h3>
            <p className="text-white/80">Find products from Amazon, Best Buy, Target, and Walmart</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Results</h3>
            <p className="text-white/80">Get product recommendations in seconds with pricing</p>
          </div>
        </div>
      </div>
    </div>
  );
}