
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
      console.error("Missing Stripe secret key in environment variables");
      throw new Error("Missing Stripe secret key");
    }
    
    console.log("Stripe secret key found, initializing Stripe...");
    
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
        if (!params.amount) {
          throw new Error("Amount is required for creating a payment intent");
        }
        
        console.log(`Creating payment intent for amount: ${params.amount}`);
        
        result = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency || 'usd',
          payment_method_types: ['card'],
          metadata: params.metadata || {},
        });
        
        console.log(`Payment intent created with id: ${result.id}`);
        break;
      
      case 'get-subscription-plans':
        console.log("Fetching subscription plans from Stripe");
        
        result = await stripe.prices.list({
          active: true,
          type: 'recurring',
          expand: ['data.product'],
        });
        
        console.log(`Retrieved ${result.data.length} subscription plans`);
        break;
      
      case 'createPaymentIntent':
        // Support the case in StripeCheckout.tsx
        if (!params.amount) {
          throw new Error("Amount is required for creating a payment intent");
        }
        
        console.log(`Creating payment intent for amount: ${params.amount}, description: ${params.description || 'N/A'}`);
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency || 'usd',
          payment_method_types: ['card'],
          metadata: {
            payment_id: params.payment_id,
            description: params.description || '',
            ...params.metadata
          },
        });
        
        console.log(`Payment intent created with id: ${paymentIntent.id}`);
        
        result = {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        };
        break;
      
      case 'updatePaymentStatus':
        if (!params.payment_id) {
          throw new Error("Payment ID is required for updating payment status");
        }
        
        console.log(`Updating payment status for payment_id: ${params.payment_id}, status: ${params.status}`);
        
        // This would typically update your database record
        // For now, just return a success confirmation
        result = {
          success: true,
          payment_id: params.payment_id,
          status: params.status
        };
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
        errorType: error.type || "unknown_error",
        timestamp: new Date().toISOString()
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
