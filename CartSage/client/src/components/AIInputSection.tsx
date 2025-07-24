import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Keyboard, FileText, Wand2, Upload, CloudUpload, Brain, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIInputSectionProps {
  sessionId: string;
}

export default function AIInputSection({ sessionId }: AIInputSectionProps) {
  const [inputMode, setInputMode] = useState<'text' | 'document'>('text');
  const [checklistText, setChecklistText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const processTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/process-checklist", {
        text,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setChecklistText("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process checklist: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const processDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('sessionId', sessionId);
      
      const response = await fetch("/api/ai/process-document", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process document");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Processed!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleTextSubmit = () => {
    if (!checklistText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }
    processTextMutation.mutate(checklistText.trim());
  };

  const handleFileSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "Error", 
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }
    processDocumentMutation.mutate(selectedFile);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const isProcessing = processTextMutation.isPending || processDocumentMutation.isPending;

  return (
    <section className="ai-gradient animate-gradient text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Transform Your Checklist into Products</h2>
          <p className="text-xl opacity-90">AI-powered product discovery across Amazon, Best Buy, Target & Walmart</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Input Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={() => setInputMode('text')}
              variant={inputMode === 'text' ? "secondary" : "ghost"}
              className={`px-6 py-3 rounded-lg backdrop-blur-sm border border-white border-opacity-30 text-white font-medium transition-all duration-200 ${
                inputMode === 'text' 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-white bg-opacity-10 hover:bg-opacity-20'
              }`}
            >
              <Keyboard className="mr-2" size={18} />
              Text Input
            </Button>
            <Button
              onClick={() => setInputMode('document')}
              variant={inputMode === 'document' ? "secondary" : "ghost"}
              className={`px-6 py-3 rounded-lg backdrop-blur-sm border border-white border-opacity-20 text-white font-medium transition-all duration-200 ${
                inputMode === 'document' 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-white bg-opacity-10 hover:bg-opacity-20'
              }`}
            >
              <FileText className="mr-2" size={18} />
              Upload Document
            </Button>
          </div>

          {/* Text Input Mode */}
          {inputMode === 'text' && (
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                  placeholder="Enter your shopping checklist... (e.g., 'Need laptop for work, wireless headphones, kitchen blender, running shoes')"
                  className="w-full h-32 p-4 rounded-xl bg-white bg-opacity-90 text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 resize-none"
                  disabled={isProcessing}
                />
                <div className="absolute bottom-4 right-4 text-gray-500 text-sm flex items-center">
                  <Brain className="mr-1" size={16} />
                  AI Processing
                </div>
              </div>
              <Button
                onClick={handleTextSubmit}
                disabled={isProcessing || !checklistText.trim()}
                className="w-full bg-white text-[var(--ai-purple)] font-semibold py-4 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2" size={18} />
                    Convert to Products with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Document Upload Mode */}
          {inputMode === 'document' && (
            <div className="space-y-4">
              <Card className="border-2 border-dashed border-white border-opacity-50 rounded-xl p-8 text-center hover:border-opacity-70 transition-colors duration-200 bg-white bg-opacity-10 backdrop-blur-sm">
                <CloudUpload className="mx-auto text-4xl mb-4 opacity-70" size={48} />
                <p className="text-lg mb-2">Drop your PDF checklist here</p>
                <p className="text-sm opacity-70 mb-4">Supports PDF, DOC, TXT files up to 10MB</p>
                {selectedFile ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                    <p className="text-xs opacity-70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : null}
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    className="bg-white bg-opacity-20 px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                    disabled={isProcessing}
                  >
                    <Upload className="mr-2" size={16} />
                    Choose File
                  </Button>
                </label>
              </Card>
              {selectedFile && (
                <Button
                  onClick={handleFileSubmit}
                  disabled={isProcessing}
                  className="w-full bg-white text-[var(--ai-purple)] font-semibold py-4 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Processing Document...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2" size={18} />
                      Process Document with AI
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="bg-white rounded-xl p-8 max-w-md mx-4 transform scale-100 transition-transform duration-300">
            <div className="text-center">
              <div className="w-16 h-16 ai-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                <Brain className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing Your List</h3>
              <p className="text-gray-600 mb-6">
                Our AI is analyzing your {inputMode === 'text' ? 'checklist' : 'document'} and finding the best products across multiple retailers...
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-[var(--ai-purple)] rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-[var(--ai-indigo)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-[var(--ai-emerald)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
