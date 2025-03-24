
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.3.0'

// Set up proper CORS headers that allow requests from codecove.dev
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins including codecove.dev
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8', // Add UTF-8 charset
  'X-Content-Type-Options': 'nosniff', // Prevent MIME-sniffing
  'Content-Security-Policy': "frame-ancestors 'none'", // Modern alternative to X-Frame-Options
  'Cache-Control': 'no-store, max-age=0' // Prevent caching of sensitive data
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
      apiVersion: '2023-10-16' // Use a current API version
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
      
      // Handle other actions
      case 'createPaymentIntent':
        const { amount, currency } = params
        if (!amount || !currency) {
          throw new Error('Missing required parameters for creating a payment intent')
        }

        result = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
        })
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
