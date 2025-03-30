
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Initialize Stripe
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
  });
  
  try {
    const payload = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    // Verify stripe signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Received stripe webhook event: ${event.type}`);
    
    // Process event based on type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        
        if (!userId || !planId) {
          console.log('Missing user_id or plan_id in metadata');
          break;
        }
        
        // Update payment history
        await supabase
          .from('payment_history')
          .update({
            status: 'completed',
            payment_method: session.payment_method_types?.[0] || 'card',
          })
          .eq('metadata->checkout_session_id', session.id);
        
        // Add to user workout plans if it's a training plan
        if (session.metadata?.plan_type === 'training') {
          await supabase
            .from('workout_plans')
            .insert({
              user_id: userId,
              title: session.metadata?.plan_name || 'Custom Training Plan',
              plan_type: 'purchased',
              description: 'Purchased training plan',
            });
        }
        
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object;
        
        // Update payment history for expired sessions
        await supabase
          .from('payment_history')
          .update({
            status: 'expired',
          })
          .eq('metadata->checkout_session_id', session.id);
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update payment in database
        await supabase
          .from('payment_history')
          .update({
            status: 'succeeded',
            payment_method: paymentIntent.payment_method_types?.[0] || 'card',
          })
          .eq('stripe_payment_id', paymentIntent.id);
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Update payment status in database
        await supabase
          .from('payment_history')
          .update({
            status: 'failed',
          })
          .eq('stripe_payment_id', paymentIntent.id);
        
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        
        // Get user_id from stripe_customers table
        const { data: customer } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();
        
        if (!customer) {
          console.log(`Customer not found for stripe_customer_id: ${stripeCustomerId}`);
          break;
        }
        
        // Update or create subscription in database
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (!existingSub) {
          await supabase
            .from('subscriptions')
            .insert({
              user_id: customer.user_id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_id: subscription.items.data[0].price.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              metadata: subscription.metadata,
            });
        } else {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status in database
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
