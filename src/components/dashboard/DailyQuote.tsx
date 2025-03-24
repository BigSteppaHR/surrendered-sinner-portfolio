
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface Quote {
  id: string;
  quote: string;
  author: string;
}

const DailyQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      try {
        // Try to get a random quote from our quotes table
        const { data, error } = await supabase
          .from('daily_quotes')
          .select('id, quote, author')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error || !data) {
          // Fallback to hardcoded quote if query fails
          setQuote({
            id: '1',
            quote: "The only bad workout is the one that didn't happen.",
            author: "Unknown"
          });
        } else {
          setQuote(data);
        }
      } catch (err) {
        console.error('Error fetching quote:', err);
        // Fallback
        setQuote({
          id: '1',
          quote: "Strive for progress, not perfection.",
          author: "Unknown"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    
    // Refresh quote every 24 hours
    const interval = setInterval(fetchQuote, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4 flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <blockquote className="italic text-white">
          "{quote?.quote}"
        </blockquote>
        <div className="mt-2 text-right text-sm text-gray-400">
          — {quote?.author || 'Unknown'}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
