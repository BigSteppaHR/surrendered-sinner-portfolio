
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers - allow any origin or use environment variable if set
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Fetching daily quote");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get quote from database using the function
    const { data, error } = await supabase.rpc('get_quote_of_the_day');
    
    if (error) {
      console.error("Error fetching quote:", error);
      throw error;
    }
    
    // If no quotes found, return default quote
    if (!data || data.length === 0) {
      const defaultQuote = {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      };
      
      console.log("No quotes found, returning default quote");
      
      return new Response(
        JSON.stringify(defaultQuote),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
    
    console.log("Quote fetched successfully");
    
    // Return the quote with CORS headers
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-daily-quote function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        quote: "Every setback is a setup for a comeback.",
        author: "Unknown"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }
});
