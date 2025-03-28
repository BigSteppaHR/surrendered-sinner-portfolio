import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.8.0?target=deno';

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Stripe API key from environment variables
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_API_KEY');
    
    if (!STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_API_KEY environment variable");
      throw new Error('Missing STRIPE_API_KEY environment variable');
    }
    
    // Log key availability for debugging (not logging the actual key)
    const keyAvailability = {
      keyExists: !!STRIPE_SECRET_KEY,
      keyLength: STRIPE_SECRET_KEY?.length || 0,
      keyPrefix: STRIPE_SECRET_KEY?.startsWith('sk_') ? 'sk_' : 'none'
    };
    console.log("Stripe key availability check:", keyAvailability);

    // Initialize Stripe with the secret key
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Parse the request body
    const { action, params } = await req.json();

    // Handle different actions
    let result;
    
    switch (action) {
      case 'test-connection':
        // Return the publishable key along with success message
        const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
        result = { 
          success: true, 
          message: 'Connection to Stripe helper function successful',
          stripeKeyAvailable: !!STRIPE_SECRET_KEY,
          publishableKey: publishableKey || null
        };
        break;
        
      case 'get-dashboard-data':
        // Get basic Stripe account information to confirm API connection works
        const account = await stripe.accounts.retrieve();
        result = { 
          status: 'connected',
          accountId: account.id,
          accountName: account.business_profile?.name || 'Not specified',
          detailsSubmitted: account.details_submitted
        };
        break;
        
      case 'create-payment-intent':
        // Create a payment intent for a one-time payment
        if (!params?.amount) {
          throw new Error('Amount is required for payment intent');
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: params.amount,
          currency: params.currency || 'usd',
          description: params.description || 'Payment to Surrendered Sinner Fitness',
          metadata: params.metadata || {},
          payment_method_types: ['card'],
        });
        
        result = {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id
        };
        break;
        
      case 'create-checkout-session':
        // Create a checkout session for subscription or one-time payment
        if (!params?.priceId) {
          throw new Error('Price ID is required for checkout session');
        }
        
        const session = await stripe.checkout.sessions.create({
          customer_email: params.customerEmail,
          customer: params.customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: params.priceId,
              quantity: params.quantity || 1,
            },
          ],
          mode: params.mode || 'subscription',
          success_url: `${params.successUrl || req.headers.get('origin') + '/payment-success'}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: params.cancelUrl || req.headers.get('origin') + '/payment-error',
          metadata: params.metadata || {},
        });
        
        result = {
          id: session.id,
          url: session.url
        };
        break;
        
      case 'create-customer':
        // Create or retrieve a Stripe customer for the user
        if (!params?.email) {
          throw new Error('Email is required to create a customer');
        }
        
        // Check if customer already exists
        const customers = await stripe.customers.list({
          email: params.email,
          limit: 1
        });
        
        let customer;
        
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: params.email,
            name: params.name || undefined,
            metadata: {
              user_id: params.userId || undefined
            }
          });
        }
        
        result = {
          id: customer.id,
          email: customer.email,
          name: customer.name
        };
        break;
        
      case 'get-subscription':
        // Get a subscription details
        if (!params?.subscriptionId) {
          throw new Error('Subscription ID is required');
        }
        
        const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);
        
        result = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          customer: subscription.customer,
          items: subscription.items.data
        };
        break;
        
      case 'cancel-subscription':
        // Cancel a subscription
        if (!params?.subscriptionId) {
          throw new Error('Subscription ID is required');
        }
        
        const canceledSubscription = await stripe.subscriptions.cancel(params.subscriptionId);
        
        result = {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          canceledAt: canceledSubscription.canceled_at ? new Date(canceledSubscription.canceled_at * 1000).toISOString() : null
        };
        break;
        
      case 'get-payment-method':
        // Get payment method details
        if (!params?.paymentMethodId) {
          throw new Error('Payment method ID is required');
        }
        
        const paymentMethod = await stripe.paymentMethods.retrieve(params.paymentMethodId);
        
        result = {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year
          } : null
        };
        break;
        
      case 'update-payment-method':
        // Update default payment method for customer
        if (!params?.customerId || !params?.paymentMethodId) {
          throw new Error('Customer ID and payment method ID are required');
        }
        
        await stripe.customers.update(params.customerId, {
          invoice_settings: {
            default_payment_method: params.paymentMethodId
          }
        });
        
        result = { success: true };
        break;
        
      case 'updatePaymentStatus':
        // Update payment status in our database via Stripe
        if (!params?.payment_id || !params?.status) {
          throw new Error('Payment ID and status are required');
        }
        
        // Here you would typically update your database record
        // For this example, we'll just return success
        result = { 
          success: true,
          payment_id: params.payment_id,
          status: params.status,
          payment_intent_id: params.payment_intent_id || null
        };
        break;
        
      case 'get-prices':
        // Get all active prices for subscriptions
        const prices = await stripe.prices.list({
          active: true,
          type: 'recurring',
          expand: ['data.product']
        });
        
        result = prices.data.map(price => ({
          id: price.id,
          product: {
            id: typeof price.product === 'string' ? price.product : price.product.id,
            name: typeof price.product === 'string' ? 'Unknown' : price.product.name,
            description: typeof price.product === 'string' ? null : price.product.description
          },
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
          active: price.active
        }));
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return the result as JSON
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in stripe-helper function:", error);
    
    // Return a formatted error response
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred processing your request',
        code: error.code || 'unknown_error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.statusCode || 500,
      }
    );
  }
});
