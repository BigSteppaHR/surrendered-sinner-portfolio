
import { useState, useEffect } from "react";
import { Quote, Plus, Trash, RefreshCw, Filter, Edit, Star, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type DailyQuote = {
  id: string;
  quote: string;
  author: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<DailyQuote | null>(null);
  const [newQuote, setNewQuote] = useState({
    quote: "",
    author: "",
    isActive: true,
    isFeatured: false
  });
  const { toast } = useToast();

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setQuotes(data || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter(quote => 
    quote.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quote.author && quote.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddOrUpdateQuote = async () => {
    try {
      if (!newQuote.quote.trim()) {
        toast({
          title: "Error",
          description: "Quote text is required",
          variant: "destructive"
        });
        return;
      }
      
      const quoteData = {
        quote: newQuote.quote,
        author: newQuote.author || null,
        is_active: newQuote.isActive,
        is_featured: newQuote.isFeatured
      };
      
      if (editingQuote) {
        // Update existing quote
        const { error } = await supabase
          .from("daily_quotes")
          .update(quoteData)
          .eq("id", editingQuote.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quote updated successfully"
        });
      } else {
        // Create new quote
        const { error } = await supabase
          .from("daily_quotes")
          .insert(quoteData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quote created successfully"
        });
      }
      
      // Reset form and close dialog
      setNewQuote({
        quote: "",
        author: "",
        isActive: true,
        isFeatured: false
      });
      setEditingQuote(null);
      setIsAddDialogOpen(false);
      
      // Refresh quotes list
      fetchQuotes();
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("daily_quotes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setQuotes(quotes.filter(quote => quote.id !== id));
      
      toast({
        title: "Success",
        description: "Quote deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("daily_quotes")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setQuotes(quotes.map(quote => 
        quote.id === id ? { ...quote, is_active: !currentStatus } : quote
      ));
      
      toast({
        title: "Success",
        description: `Quote ${!currentStatus ? "activated" : "deactivated"} successfully`
      });
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("daily_quotes")
        .update({ is_featured: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setQuotes(quotes.map(quote => 
        quote.id === id ? { ...quote, is_featured: !currentStatus } : quote
      ));
      
      toast({
        title: "Success",
        description: `Quote ${!currentStatus ? "featured" : "unfeatured"} successfully`
      });
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  const handleEditQuote = (quote: DailyQuote) => {
    setEditingQuote(quote);
    setNewQuote({
      quote: quote.quote,
      author: quote.author || "",
      isActive: quote.is_active,
      isFeatured: quote.is_featured
    });
    setIsAddDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Quotes</h1>
        <Badge variant="outline" className="bg-sinner-red/10 text-sinner-red border-sinner-red/20">
          Admin Portal
        </Badge>
      </div>

      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Quote className="h-5 w-5 text-sinner-red mr-2" />
            Motivational Quotes
          </CardTitle>
          <CardDescription>
            Manage daily motivational quotes shown to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => {
                    setEditingQuote(null);
                    setNewQuote({
                      quote: "",
                      author: "",
                      isActive: true,
                      isFeatured: false
                    });
                    setIsAddDialogOpen(true);
                  }}
                  className="bg-sinner-red hover:bg-sinner-red/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quote
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchQuotes}
                  className="border-[#333333]"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search quotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-[#1A1A1A] border-[#333333]"
                />
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <RefreshCw className="h-10 w-10 animate-spin text-sinner-red" />
              </div>
            ) : filteredQuotes.length > 0 ? (
              <div className="border rounded-md border-[#333333]">
                <Table>
                  <TableHeader className="bg-[#1A1A1A]">
                    <TableRow className="border-[#333333] hover:bg-[#1A1A1A]">
                      <TableHead className="text-white">Quote</TableHead>
                      <TableHead className="text-white">Author</TableHead>
                      <TableHead className="text-white">Active</TableHead>
                      <TableHead className="text-white">Featured</TableHead>
                      <TableHead className="text-white">Added</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id} className="border-[#333333] hover:bg-[#1A1A1A]">
                        <TableCell className="font-medium max-w-md truncate">
                          "{quote.quote}"
                        </TableCell>
                        <TableCell>{quote.author || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(quote.id, quote.is_active)}
                            className={`h-8 ${
                              quote.is_active 
                                ? "text-green-500 hover:text-green-600" 
                                : "text-gray-400 hover:text-gray-500"
                            }`}
                          >
                            {quote.is_active ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            {quote.is_active ? "Active" : "Inactive"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(quote.id, quote.is_featured)}
                            className={`h-8 ${
                              quote.is_featured 
                                ? "text-yellow-500 hover:text-yellow-600" 
                                : "text-gray-400 hover:text-gray-500"
                            }`}
                          >
                            <Star className={`h-4 w-4 mr-1 ${quote.is_featured ? "fill-yellow-500" : ""}`} />
                            {quote.is_featured ? "Featured" : "Not Featured"}
                          </Button>
                        </TableCell>
                        <TableCell>{formatDate(quote.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuote(quote)}
                              className="h-8 border-[#333333] text-gray-400 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="h-8 text-gray-400 hover:text-sinner-red"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <Quote className="h-10 w-10 text-gray-500 mb-2" />
                <h3 className="text-lg font-medium">No quotes found</h3>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "No quotes match your search criteria"
                    : "There are no daily quotes yet. Click 'Add Quote' to create one."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Quote Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Edit Quote" : "Add New Quote"}
            </DialogTitle>
            <DialogDescription>
              {editingQuote 
                ? "Modify the existing quote" 
                : "Add a new motivational quote to the system"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="quote" className="text-right pt-2">
                Quote
              </Label>
              <Textarea
                id="quote"
                value={newQuote.quote}
                onChange={(e) => setNewQuote({...newQuote, quote: e.target.value})}
                className="col-span-3 h-20 bg-[#1A1A1A] border-[#333333]"
                placeholder="Enter inspirational quote text here"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                value={newQuote.author}
                onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
                placeholder="Optional author name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isActive"
                  checked={newQuote.isActive}
                  onCheckedChange={(checked) => 
                    setNewQuote({...newQuote, isActive: checked})
                  }
                />
                <Label htmlFor="isActive">
                  Quote is available for selection
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="isFeatured" className="text-right">
                  Featured
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isFeatured"
                  checked={newQuote.isFeatured}
                  onCheckedChange={(checked) => 
                    setNewQuote({...newQuote, isFeatured: checked})
                  }
                />
                <Label htmlFor="isFeatured">
                  Prioritize this quote in selection
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="border-[#333333]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddOrUpdateQuote}
              className="bg-sinner-red hover:bg-sinner-red/80"
            >
              {editingQuote ? "Update Quote" : "Save Quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotes;
