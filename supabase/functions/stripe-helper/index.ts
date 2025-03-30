
// Follow Deno imports pattern for edge functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.7.0?target=deno";

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { action, params } = requestData;

    // Initialize Stripe with the secret key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    }) : null;

    console.log(`Processing ${action} with params:`, params);

    // Handle different actions
    switch (action) {
      case "test-connection":
        return new Response(
          JSON.stringify({
            success: true,
            stripeKeyAvailable: !!stripeSecretKey,
            message: "Connection to Stripe helper function successful",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );

      case "get-publishable-key":
        const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
        if (!publishableKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Stripe publishable key not configured",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            publishableKey,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );

      case "createPaymentIntent":
        if (!stripe) {
          throw new Error("Stripe not initialized - missing API key");
        }
        
        if (!params || !params.amount || !params.currency || !params.payment_id) {
          throw new Error("Missing required parameters for creating payment intent");
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency,
          metadata: {
            payment_id: params.payment_id,
            description: params.description || 'Payment',
          },
        });
        
        return new Response(
          JSON.stringify({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );

      case "updatePaymentStatus":
        if (!stripe) {
          throw new Error("Stripe not initialized - missing API key");
        }
        
        const { payment_id, status, payment_intent_id, payment_method, amount, description } = params;
        
        if (!payment_id || !status) {
          throw new Error("Missing required parameters for updating payment status");
        }
        
        // Here you would update the payment status in your database
        // This is just a placeholder - you would implement the actual update logic
        console.log(`Updating payment ${payment_id} to status ${status}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            payment_id,
            status,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
  } catch (error) {
    console.error("Error in stripe-helper function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
