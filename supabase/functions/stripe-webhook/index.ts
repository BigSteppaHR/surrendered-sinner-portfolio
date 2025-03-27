
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tcxwvsyfqjcgglyqlahl.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
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
        
        // Process completed checkout session
        const customerId = session.customer;
        const userId = session.metadata?.user_id;
        
        try {
          // If we have a user ID in the metadata, update records in our database
          if (userId) {
            // First, check if we already have this customer in our records
            const { data: existingCustomer } = await supabase
              .from('stripe_customers')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();
              
            // If not, store the customer ID for future reference
            if (!existingCustomer) {
              await supabase.from('stripe_customers').insert({
                user_id: userId,
                stripe_customer_id: customerId
              });
            }
            
            // Update payment history with successful payment
            await supabase.from('payment_history').insert({
              user_id: userId,
              amount: session.amount_total,
              currency: session.currency,
              status: 'completed',
              payment_method: 'stripe',
              stripe_payment_id: session.id,
              description: session.metadata?.description || 'Stripe Checkout',
              metadata: {
                checkout_session_id: session.id,
                customer_id: customerId,
                payment_intent: session.payment_intent
              }
            });
            
            // If it's a subscription (recurring payment)
            if (session.mode === 'subscription' && session.subscription) {
              // Store the subscription in our database
              await supabase.from('subscriptions').insert({
                user_id: userId,
                stripe_subscription_id: session.subscription,
                status: 'active',
                plan_id: session.metadata?.plan_id || 'Unknown',
                metadata: {
                  checkout_session_id: session.id,
                  customer_id: customerId
                }
              });
            }
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
          // This event is more for logging - we already created the subscription record in checkout.session.completed
          console.log('New subscription:', subscription.id);
          console.log('Status:', subscription.status);
          console.log('Customer:', subscription.customer);
          
          // We could update additional details here if needed
        } catch (error) {
          console.error('Error processing subscription creation:', error);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`🔄 Subscription updated: ${subscription.id}`);
        
        try {
          // Find the user associated with this subscription
          const { data: customerData } = await supabase
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer)
            .maybeSingle();
            
          if (customerData) {
            // Update the subscription status in our database
            await supabase
              .from('subscriptions')
              .update({ 
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('stripe_subscription_id', subscription.id);
            
            // Additional processing based on status changes
            if (subscription.status === 'active') {
              console.log('Subscription is now active');
              
              // You might want to update user roles or permissions here
            } else if (subscription.status === 'past_due') {
              console.log('Subscription is past due');
              
              // You might want to send the user a notification
            } else if (subscription.status === 'canceled') {
              console.log('Subscription was canceled');
              
              // Remove any premium access
            }
          }
        } catch (error) {
          console.error('Error processing subscription update:', error);
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`💵 Invoice payment succeeded: ${invoice.id}`);
        
        try {
          // Find the user associated with this customer
          const { data: customerData } = await supabase
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', invoice.customer)
            .maybeSingle();
            
          if (customerData) {
            // Record the successful payment
            await supabase.from('payment_history').insert({
              user_id: customerData.user_id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'completed',
              payment_method: 'stripe',
              stripe_payment_id: invoice.id,
              description: invoice.description || 'Subscription Payment',
              metadata: {
                invoice_id: invoice.id,
                customer_id: invoice.customer,
                subscription_id: invoice.subscription
              }
            });
          }
        } catch (error) {
          console.error('Error processing invoice payment:', error);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`❌ Invoice payment failed: ${invoice.id}`);
        
        try {
          // Find the user associated with this customer
          const { data: customerData } = await supabase
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', invoice.customer)
            .maybeSingle();
            
          if (customerData) {
            // Record the failed payment
            await supabase.from('payment_history').insert({
              user_id: customerData.user_id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              payment_method: 'stripe',
              stripe_payment_id: invoice.id,
              description: 'Failed payment: ' + (invoice.description || 'Subscription Payment'),
              metadata: {
                invoice_id: invoice.id,
                customer_id: invoice.customer,
                subscription_id: invoice.subscription,
                attempt_count: invoice.attempt_count
              }
            });
            
            // You might want to notify the user or admin about the failed payment
          }
        } catch (error) {
          console.error('Error processing failed invoice payment:', error);
        }
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
