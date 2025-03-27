
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

// Define CORS headers - allow any origin or use environment variable if set
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Get the Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe secret key");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use the latest stable API version
    });
    
    // Get the request body
    const { action, params } = await req.json();
    
    console.log(`Stripe helper: Executing action ${action}`);
    
    let result;
    
    // Process different actions
    switch (action) {
      case 'get-dashboard-data':
        // For testing connection only
        result = { status: 'connected' };
        break;
      
      case 'create-payment-intent':
        result = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency || 'usd',
          payment_method_types: ['card'],
          metadata: params.metadata || {},
        });
        break;
      
      case 'get-subscription-plans':
        result = await stripe.prices.list({
          active: true,
          type: 'recurring',
          expand: ['data.product'],
        });
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Return successful response with CORS headers
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe helper error:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while processing the request",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
