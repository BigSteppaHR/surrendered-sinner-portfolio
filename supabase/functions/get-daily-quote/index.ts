
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase client');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query for a random quote
    const { data, error } = await supabase
      .from('daily_quotes')
      .select('id, quote, author')
      .eq('is_active', true)
      .order('random()')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      
      // Return a fallback quote
      return new Response(JSON.stringify({
        id: '0',
        quote: "The only bad workout is the one that didn't happen.",
        author: "Unknown"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Return the quote
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get-daily-quote function:', error);
    
    // Return a fallback quote with error info
    return new Response(JSON.stringify({
      id: '0',
      quote: "Strive for progress, not perfection.",
      author: "Unknown",
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
