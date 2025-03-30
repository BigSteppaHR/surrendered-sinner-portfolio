
// Follow this setup guide to integrate the Deno runtime and use Edge Functions:
// https://docs.supabase.com/docs/guides/getting-started/tutorials/with-react#deploy-a-supabase-edge-function
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.1.1?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Parse request body
    const { action, params } = await req.json();

    console.log("Processing " + action + " with params:", params);

    // Handle different actions
    switch (action) {
      case 'get-publishable-key':
        const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
        
        if (!publishableKey) {
          return new Response(
            JSON.stringify({ error: 'Stripe publishable key not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        return new Response(
          JSON.stringify({ publishableKey }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'test-connection':
        // Test if we have Stripe set up correctly without making any requests to Stripe
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripeKeyAvailable = !!stripeKey;
        
        return new Response(
          JSON.stringify({
            success: true,
            stripeKeyAvailable,
            message: 'Connection to Stripe helper function successful'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'createPaymentIntent':
        if (!params?.amount || !params?.currency) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters: amount and currency' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            payment_id: params.payment_id || '',
            description: params.description || '',
          }
        });

        return new Response(
          JSON.stringify({ 
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'updatePaymentStatus':
        if (!params?.payment_id || !params?.status) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters: payment_id and status' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Update payment record in database
        const { data, error } = await supabase
          .from('payments')
          .update({
            status: params.status,
            payment_intent_id: params.payment_intent_id || null,
            payment_method: params.payment_method || null,
            amount: params.amount || null,
            metadata: {
              description: params.description || null
            }
          })
          .eq('id', params.payment_id)
          .select();
          
        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to update payment status: ' + error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        if (params.status === 'completed' && params.amount) {
          // If payment was successful, update user balance
          // Get the user_id from the payment record
          const payment = data[0];
          if (payment?.user_id) {
            // Check if user already has a balance
            const { data: existingBalance, error: balanceQueryError } = await supabase
              .from('payment_balance')
              .select()
              .eq('user_id', payment.user_id)
              .maybeSingle();
              
            if (balanceQueryError) {
              console.error('Error checking user balance:', balanceQueryError);
            }
            
            if (existingBalance) {
              // Update existing balance
              await supabase
                .from('payment_balance')
                .update({
                  balance: existingBalance.balance + (params.amount / 100), // Convert cents to dollars/currency units
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingBalance.id);
            } else {
              // Create new balance record
              await supabase
                .from('payment_balance')
                .insert({
                  user_id: payment.user_id,
                  balance: params.amount / 100, // Convert cents to dollars/currency units
                  currency: 'USD'
                });
            }
            
            // Add to payment history
            await supabase
              .from('payment_history')
              .insert({
                user_id: payment.user_id,
                amount: params.amount / 100,
                currency: 'USD',
                status: 'succeeded',
                payment_method: params.payment_method || 'card',
                description: params.description || 'Account deposit'
              });
          }
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (err) {
    console.error(`Error processing request:`, err);
    
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
