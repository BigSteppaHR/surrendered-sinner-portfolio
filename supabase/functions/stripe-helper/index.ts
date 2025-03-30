
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

  // Parse request body
  const { action, data } = await req.json();
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize Stripe client
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });
    
    // Get authentication header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    
    console.log(`Processing ${action} for user ${user.id}`);
    
    switch (action) {
      case 'create_checkout_session': {
        const { planId, planType, price, planName } = data;
        
        if (!planId || !planType || !price || !planName) {
          throw new Error('Missing required parameters for checkout session');
        }
        
        // Find or create customer
        let customerId;
        const { data: customers } = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        
        if (customers && customers.length > 0) {
          customerId = customers[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: { user_id: user.id },
          });
          customerId = newCustomer.id;
          
          // Store customer reference in database
          await supabase
            .from('stripe_customers')
            .insert({
              user_id: user.id,
              stripe_customer_id: customerId,
            });
        }
        
        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: planName,
                  description: `${planType} training plan`,
                },
                unit_amount: Math.round(price * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
          metadata: {
            user_id: user.id,
            plan_id: planId,
            plan_type: planType,
          },
        });
        
        // Store payment intent in database
        await supabase
          .from('payment_history')
          .insert({
            user_id: user.id,
            amount: price,
            currency: 'USD',
            status: 'pending',
            stripe_payment_id: session.payment_intent as string,
            description: `Payment for ${planName}`,
            metadata: {
              plan_id: planId,
              plan_type: planType,
              checkout_session_id: session.id,
            },
          });
        
        return new Response(JSON.stringify({ url: session.url }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      case 'get_payment_history': {
        // Get payment history for the authenticated user
        const { data: payments, error: paymentsError } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (paymentsError) {
          throw paymentsError;
        }
        
        return new Response(JSON.stringify({ payments }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      case 'get_active_subscriptions': {
        // Check if user has any active subscriptions
        const { data: stripeCustomer } = await supabase
          .from('stripe_customers')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();
        
        if (!stripeCustomer) {
          return new Response(JSON.stringify({ subscriptions: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
        // Get subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomer.stripe_customer_id,
          status: 'active',
        });
        
        // Sync with our database
        for (const sub of subscriptions.data) {
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', sub.id)
            .single();
          
          if (!existingSub) {
            await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                stripe_subscription_id: sub.id,
                status: sub.status,
                plan_id: sub.items.data[0].price.id,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                metadata: sub.metadata,
              });
          } else {
            await supabase
              .from('subscriptions')
              .update({
                status: sub.status,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_subscription_id', sub.id);
          }
        }
        
        // Get synchronized subscriptions from our database
        const { data: userSubscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        return new Response(JSON.stringify({ subscriptions: userSubscriptions || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
