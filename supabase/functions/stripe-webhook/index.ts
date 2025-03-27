
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Define enhanced CORS headers with Stripe signature support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Error: Missing Stripe signature');
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the webhook secret and API key from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    
    if (!webhookSecret || !stripeKey) {
      console.error('Error: Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the raw request body
    const rawBody = await req.text();
    
    // Initialize Stripe with explicit API version
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16', // Using a stable version
    });

    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Event received: ${event.type}`);
    
    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`💰 Payment successful for session: ${session.id}`);
        
        // Update subscription or payment status in database
        // This would depend on your database schema
        try {
          // Here we would update the payment or subscription status
          // For example, mark a payment as completed or activate a subscription
          console.log('Processing checkout session:', session.id);
          
          // Example: For one-time payments
          if (session.mode === 'payment') {
            // Handle one-time payment
            console.log('Processing one-time payment');
          }
          
          // Example: For subscriptions
          if (session.mode === 'subscription') {
            // Handle subscription payment
            console.log('Processing subscription payment');
          }
        } catch (error) {
          console.error('Error processing checkout session:', error);
        }
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log(`🔄 Subscription created: ${subscription.id}`);
        
        try {
          // Create or update subscription record
          console.log('New subscription:', subscription.id);
          console.log('Status:', subscription.status);
          console.log('Customer:', subscription.customer);
        } catch (error) {
          console.error('Error processing subscription creation:', error);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`🔄 Subscription updated: ${subscription.id}`);
        
        try {
          // Update subscription status
          console.log('Updated subscription:', subscription.id);
          console.log('New status:', subscription.status);
          
          // Check for specific status changes
          if (subscription.status === 'active') {
            console.log('Subscription is now active');
          } else if (subscription.status === 'past_due') {
            console.log('Subscription is past due');
          } else if (subscription.status === 'canceled') {
            console.log('Subscription was canceled');
          }
        } catch (error) {
          console.error('Error processing subscription update:', error);
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`💵 Invoice payment succeeded: ${invoice.id}`);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`❌ Invoice payment failed: ${invoice.id}`);
        break;
      }
      
      // Add other event types as needed
      
      default:
        console.log(`🤔 Unhandled event type: ${event.type}`);
    }

    // Return a successful response
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`💥 Webhook error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
