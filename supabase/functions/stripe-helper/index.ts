
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.3.0'

// Set up proper CORS headers that allow requests from your domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins including codecove.dev
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'private, max-age=3600'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
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
        break
      
      case 'createPaymentIntent':
        console.log('Creating payment intent with params:', params)
        const { amount, currency, payment_id, description } = params
        if (!amount || !currency) {
          throw new Error('Missing required parameters for creating a payment intent')
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
          description: description || 'Payment',
          metadata: {
            payment_id: payment_id || 'unknown'
          }
        })
        
        console.log('Payment intent created:', paymentIntent.id)
        
        result = {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        }
        break
      
      case 'updatePaymentStatus':
        const { payment_id, status, payment_intent_id, payment_method } = params
        if (!payment_id || !status) {
          throw new Error('Missing required parameters for updating payment status')
        }
        
        // In a real implementation, you'd update the payment status in the database
        console.log(`Updating payment ${payment_id} status to ${status}`)
        
        // This action doesn't interact directly with Stripe, just our database
        // The client will handle this via supabase directly
        result = {
          success: true,
          payment_id,
          status
        }
        break
      
      case 'retrievePaymentIntent':
        const { paymentIntentId } = params
        if (!paymentIntentId) {
          throw new Error('Missing payment intent ID')
        }
        
        result = await stripe.paymentIntents.retrieve(paymentIntentId)
        break
        
      case 'listPaymentMethods':
        const { customerId } = params
        if (!customerId) {
          throw new Error('Missing customer ID')
        }
        
        result = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        })
        break
      
      // Handle dashboard data request for admin
      case 'get-dashboard-data':
        console.log('Fetching dashboard data')
        // For development, return mock data instead of actual Stripe API calls
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
            { name: 'Basic Plan', value: 45, color: '#9b87f5' },
            { name: 'Premium Plan', value: 30, color: '#7E69AB' },
            { name: 'Elite Plan', value: 15, color: '#6E59A5' },
            { name: 'Custom Plan', value: 10, color: '#5C4A9F' }
          ]
        }
        break
      
      case 'handleStripeWebhook':
        // This case should be handled by a separate function, not directly in this helper
        throw new Error('Webhook handling should be done in a separate function')
      
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
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: corsHeaders
      }
    )
  }
})
