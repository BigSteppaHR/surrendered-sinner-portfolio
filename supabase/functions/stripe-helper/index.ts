
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.3.0'

// Set up proper CORS headers that allow requests from all origins with additional stripe-signature header
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins - replace with your domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'private, max-age=3600'
}

serve(async (req) => {
  // Handle CORS preflight requests - this must be first
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // First, check if this is a webhook request from Stripe
    const url = new URL(req.url);
    
    // Special handling for Stripe webhook requests
    if (url.pathname.endsWith('/webhook')) {
      return await handleStripeWebhook(req);
    }
    
    // Get the request body for regular API requests
    const { action, params } = await req.json()

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16'
    })

    let result
    
    // Process different actions
    switch (action) {
      case 'createCheckoutSession':
        const { price, quantity = 1, success_url, cancel_url } = params
        if (!price || !success_url || !cancel_url) {
          throw new Error('Missing required parameters for creating a checkout session')
        }

        try {
          result = await stripe.checkout.sessions.create({
            line_items: [
              {
                price,
                quantity,
              },
            ],
            mode: 'payment',
            success_url,
            cancel_url,
          })
        } catch (error) {
          console.error('Stripe checkout session creation error:', error)
          throw new Error(`Failed to create checkout session: ${error.message}`)
        }
        break
      
      case 'createPaymentIntent':
        console.log('Creating payment intent with params:', params)
        const { amount, currency, description } = params
        const paymentId = params.payment_id
        
        if (!amount || !currency) {
          throw new Error('Missing required parameters for creating a payment intent')
        }

        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
              enabled: true,
            },
            description: description || 'Payment',
            metadata: {
              payment_id: paymentId || 'unknown'
            }
          })
          
          console.log('Payment intent created:', paymentIntent.id)
          
          result = {
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
          }
        } catch (error) {
          console.error('Stripe payment intent creation error:', error)
          throw new Error(`Failed to create payment intent: ${error.message}`)
        }
        break
      
      case 'updatePaymentStatus':
        const updateParams = params
        const updatePaymentId = updateParams.payment_id
        const status = updateParams.status
        const payment_intent_id = updateParams.payment_intent_id
        const payment_method = updateParams.payment_method
        
        if (!updatePaymentId || !status) {
          throw new Error('Missing required parameters for updating payment status')
        }
        
        // In a real implementation, you'd update the payment status in the database
        console.log(`Updating payment ${updatePaymentId} status to ${status}`)
        
        // This action doesn't interact directly with Stripe, just our database
        // The client will handle this via supabase directly
        result = {
          success: true,
          payment_id: updatePaymentId,
          status
        }
        break
      
      case 'retrievePaymentIntent':
        const { paymentIntentId } = params
        if (!paymentIntentId) {
          throw new Error('Missing payment intent ID')
        }
        
        try {
          result = await stripe.paymentIntents.retrieve(paymentIntentId)
        } catch (error) {
          console.error('Error retrieving payment intent:', error)
          throw new Error(`Failed to retrieve payment intent: ${error.message}`)
        }
        break
        
      case 'listPaymentMethods':
        const { customerId } = params
        if (!customerId) {
          throw new Error('Missing customer ID')
        }
        
        try {
          result = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
          })
        } catch (error) {
          console.error('Error listing payment methods:', error)
          throw new Error(`Failed to list payment methods: ${error.message}`)
        }
        break
      
      // Handle dashboard data request for admin
      case 'get-dashboard-data':
        console.log('Fetching dashboard data')
        
        try {
          // For development, return mock data until real Stripe API integration is complete
          result = {
            stats: [
              {
                id: '1',
                stat_name: 'Total Users',
                stat_value: 254,
                stat_change: 12,
                time_period: 'monthly',
                is_positive: true,
                icon: 'Users'
              },
              {
                id: '2',
                stat_name: 'Monthly Revenue',
                stat_value: 8940,
                stat_change: 8,
                time_period: 'monthly',
                is_positive: true,
                icon: 'DollarSign'
              },
              {
                id: '3',
                stat_name: 'Active Sessions',
                stat_value: 45,
                stat_change: -5,
                time_period: 'monthly',
                is_positive: false,
                icon: 'Calendar'
              },
              {
                id: '4',
                stat_name: 'Support Tickets',
                stat_value: 12,
                stat_change: 25,
                time_period: 'monthly',
                is_positive: false,
                icon: 'MessageSquare'
              }
            ],
            revenueData: [
              { month: 'Jan', revenue: 4500 },
              { month: 'Feb', revenue: 5300 },
              { month: 'Mar', revenue: 6200 },
              { month: 'Apr', revenue: 7800 },
              { month: 'May', revenue: 8200 },
              { month: 'Jun', revenue: 8940 }
            ],
            subscriptionDistribution: [
              { name: 'Basic Plan', value: 45, color: '#ea384c' },
              { name: 'Premium Plan', value: 30, color: '#c42e3e' },
              { name: 'Elite Plan', value: 15, color: '#9c2531' },
              { name: 'Custom Plan', value: 10, color: '#6e1a22' }
            ]
          }
        } catch (error) {
          console.error('Error generating dashboard data:', error)
          // Return empty data structure instead of failing
          result = {
            stats: [],
            revenueData: [],
            subscriptionDistribution: []
          }
        }
        break
      
      case 'handleStripeWebhook':
        // This case should be handled by the separate webhook handler
        throw new Error('Webhook handling should be done via the webhook endpoint')
      
      default:
        throw new Error(`Unsupported action: ${action}`)
    }

    // Return success response with CORS headers
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: corsHeaders
      }
    )
  } catch (error) {
    console.error('Stripe helper error:', error)
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        errorCode: error.code || 'unknown_error'
      }),
      { 
        status: 400,
        headers: corsHeaders
      }
    )
  }
})

/**
 * Handles Stripe webhook events
 */
async function handleStripeWebhook(req: Request) {
  try {
    // Get the stripe webhook signing secret
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error('Missing Stripe webhook secret');
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook secret not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response(
        JSON.stringify({ success: false, error: 'No signature found in request' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16'
    });

    // Get the raw body as text
    const rawBody = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ success: false, error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Webhook received: ${event.type}`);

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        
        // Update payment record in database if payment_id exists in metadata
        if (paymentIntent.metadata?.payment_id) {
          try {
            // In a real implementation, call supabase to update the database
            console.log(`Updating payment ${paymentIntent.metadata.payment_id} to succeeded via webhook`);
          } catch (error) {
            console.error('Error updating payment status:', error);
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log(`Payment failed: ${failedPaymentIntent.id}`);
        
        // Update payment record to failed
        if (failedPaymentIntent.metadata?.payment_id) {
          try {
            // In a real implementation, call supabase to update the database
            console.log(`Updating payment ${failedPaymentIntent.metadata.payment_id} to failed via webhook`);
          } catch (error) {
            console.error('Error updating payment status:', error);
          }
        }
        break;
        
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);
        break;
        
      // Add other event types as needed
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a success response
    return new Response(
      JSON.stringify({ received: true }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
