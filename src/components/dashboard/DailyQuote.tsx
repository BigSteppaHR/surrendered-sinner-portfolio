
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface DailyQuoteProps {
  onRefresh?: () => void;
  refreshTrigger?: boolean;
}

const DailyQuote: React.FC<DailyQuoteProps> = ({ onRefresh, refreshTrigger }) => {
  const [quote, setQuote] = useState({
    text: "You have achieved failure. The only way now, is to win!",
    author: "Tom Platz"
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-daily-quote');
      
      if (error) {
        console.error('Error fetching quote:', error);
        return;
      }
      
      if (data?.quote) {
        setQuote(data.quote);
      }
    } catch (error) {
      console.error('Error fetching daily quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    fetchQuote();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className="bg-[#111111] border-[#333333]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Quote className="h-5 w-5 text-sinner-red mr-2" />
            Daily Motivation
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 rounded-full border-[#333333]"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col space-y-2">
          <p className="italic text-base">""{quote.text}""</p>
          <p className="text-sm text-gray-400 self-end">- {quote.author}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
