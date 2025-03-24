
import { useState, useEffect } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type DailyQuoteType = {
  id: string;
  quote: string;
  author: string | null;
};

const DailyQuote = () => {
  const [quote, setQuote] = useState<DailyQuoteType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQuote = async () => {
    try {
      setIsRefreshing(true);
      
      // First try to get a featured quote
      let { data: featuredQuotes, error: featuredError } = await supabase
        .from("daily_quotes")
        .select("id, quote, author")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(10);
      
      if (featuredError) throw featuredError;
      
      if (featuredQuotes && featuredQuotes.length > 0) {
        // If we have featured quotes, pick a random one from the featured set
        const randomFeatured = featuredQuotes[Math.floor(Math.random() * featuredQuotes.length)];
        setQuote(randomFeatured);
      } else {
        // Fall back to any active quote if no featured quotes are available
        const { data, error } = await supabase
          .from("daily_quotes")
          .select("id, quote, author")
          .eq("is_active", true)
          .limit(20);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const randomQuote = data[Math.floor(Math.random() * data.length)];
          setQuote(randomQuote);
        }
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleRefreshQuote = () => {
    fetchQuote();
  };

  if (isLoading) {
    return (
      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Quote className="h-5 w-5 text-sinner-red mr-2" />
            Daily Motivation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-sinner-red" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#333333]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Quote className="h-5 w-5 text-sinner-red mr-2" />
            Daily Motivation
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border-[#333333]"
            onClick={handleRefreshQuote}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quote ? (
          <div className="flex flex-col space-y-2">
            <p className="italic text-base">"{quote.quote}"</p>
            {quote.author && (
              <p className="text-sm text-gray-400 self-end">- {quote.author}</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-4">No quotes available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
