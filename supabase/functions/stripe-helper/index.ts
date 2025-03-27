import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    console.log("Stripe key availability check:", {
      keyExists: !!stripeSecretKey,
      keyLength: stripeSecretKey ? stripeSecretKey.length : 0,
      keyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 5) + '...' : 'none'
    });
    
    let action = "test-connection";
    let params = {};
    
    try {
      const body = await req.json();
      action = body.action || "test-connection";
      params = body.params || {};
    } catch (parseError) {
      console.log("Could not parse request body, using defaults:", parseError);
    }
    
    if (action === 'test-connection') {
      console.log("Testing Supabase function connection...");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Connection successful",
          timestamp: new Date().toISOString(),
          stripeKeyAvailable: !!stripeSecretKey
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
    
    if (!stripeSecretKey) {
      console.error("Missing Stripe secret key in environment variables");
      throw new Error("Missing Stripe secret key");
    }
    
    console.log("Stripe secret key found, initializing Stripe...");
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    
    console.log(`Stripe helper: Executing action ${action}`);
    
    let result;
    
    switch (action) {
      case 'get-dashboard-data':
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
        
        const { data: updatedPayment, error: updateError } = await supabase
          .rpc('update_payment_status', {
            payment_id: params.payment_id,
            new_status: params.status,
            payment_intent_id: params.payment_intent_id,
            payment_method: params.payment_method
          });
          
        if (updateError) {
          console.error("Error updating payment status:", updateError);
          throw new Error(`Failed to update payment status: ${updateError.message}`);
        }
        
        result = {
          success: true,
          payment_id: params.payment_id,
          status: params.status
        };
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorType = error instanceof Error ? error.name : "unknown_error";
    
    console.error("Stripe helper error:", errorMessage);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        errorType: errorType,
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
}

serve(handler);
