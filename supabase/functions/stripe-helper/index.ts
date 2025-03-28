import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
        
        // Update payment status in the database
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: params.status,
            payment_intent_id: params.payment_intent_id,
            payment_method: params.payment_method,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.payment_id);
          
        if (updateError) {
          console.error("Error updating payment status:", updateError);
          throw new Error(`Failed to update payment status: ${updateError.message}`);
        }
        
        // If payment was completed, update the user's balance
        if (params.status === 'completed' && params.amount) {
          try {
            // Check if user already has a balance record
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user?.id) {
              throw new Error("User ID not found");
            }
            
            const { data: balanceData } = await supabase
              .from('payment_balance')
              .select('balance, currency')
              .eq('user_id', userData.user.id)
              .maybeSingle();
            
            if (balanceData) {
              // Update existing balance
              await supabase
                .from('payment_balance')
                .update({
                  balance: balanceData.balance + (params.amount / 100), // Convert cents to dollars
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', userData.user.id);
            } else {
              // Create new balance record
              await supabase
                .from('payment_balance')
                .insert({
                  user_id: userData.user.id,
                  balance: params.amount / 100, // Convert cents to dollars
                  currency: 'USD'
                });
            }
            
            // Add to payment history
            await supabase.from('payment_history').insert({
              user_id: userData.user.id,
              amount: params.amount / 100, // Convert cents to dollars
              currency: 'USD',
              status: 'completed',
              payment_method: params.payment_method || 'card',
              description: params.description || 'Added funds to account',
              metadata: { payment_id: params.payment_id }
            });
          } catch (balanceError) {
            console.error("Error updating user balance:", balanceError);
            // Don't throw here - we already updated the payment status successfully
          }
        }
        
        result = {
          success: true,
          payment_id: params.payment_id,
          status: params.status
        };
        break;
        
      case 'create-checkout-session':
        console.log("Creating Stripe checkout session...");
        
        if (!params.priceId) {
          throw new Error("Price ID is required for creating a checkout session");
        }
        
        let checkoutOptions: any = {
          line_items: [
            {
              price: params.priceId,
              quantity: 1,
            },
          ],
          mode: params.mode || 'subscription', // subscription or payment
          success_url: params.successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: params.cancelUrl || `${req.headers.get('origin')}/payment-cancelled`,
        };
        
        // If user_id is provided, save it in the metadata
        if (params.userId) {
          checkoutOptions.metadata = {
            user_id: params.userId
          };
          
          // Check if user already has a Stripe customer ID
          const { data: existingCustomer } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('user_id', params.userId)
            .maybeSingle();
            
          if (existingCustomer?.stripe_customer_id) {
            checkoutOptions.customer = existingCustomer.stripe_customer_id;
          } else if (params.userEmail) {
            // If no customer ID but email is provided, add email to create a new customer
            checkoutOptions.customer_email = params.userEmail;
          }
        } else if (params.userEmail) {
          checkoutOptions.customer_email = params.userEmail;
        }
        
        const session = await stripe.checkout.sessions.create(checkoutOptions);
        
        console.log(`Checkout session created with id: ${session.id}`);
        
        result = {
          sessionId: session.id,
          url: session.url
        };
        break;
      
      case 'create-invoice':
        if (!params.customer || !params.amount) {
          throw new Error("Customer and amount are required for creating an invoice");
        }
        
        console.log(`Creating invoice for customer: ${params.customer}, amount: ${params.amount}`);
        
        // First, ensure we have a customer in Stripe
        let customerId;
        
        if (params.customerEmail) {
          // Look up if customer exists
          const customers = await stripe.customers.list({
            email: params.customerEmail,
            limit: 1
          });
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            // Create a new customer
            const newCustomer = await stripe.customers.create({
              email: params.customerEmail,
              name: params.customerName,
              metadata: {
                user_id: params.userId
              }
            });
            
            customerId = newCustomer.id;
            
            // Save customer ID to database if we have a user ID
            if (params.userId) {
              await supabase.from('stripe_customers').insert({
                user_id: params.userId,
                stripe_customer_id: customerId
              });
            }
          }
        } else {
          throw new Error("Customer email is required for creating an invoice");
        }
        
        // Create an invoice
        const invoice = await stripe.invoices.create({
          customer: customerId,
          auto_advance: true, // automatically finalize this draft
          collection_method: 'send_invoice',
          days_until_due: params.daysUntilDue || 30,
          description: params.description || 'Training services',
          metadata: {
            invoice_id: params.invoiceId,
            user_id: params.userId
          }
        });
        
        // Add a line item
        await stripe.invoiceItems.create({
          invoice: invoice.id,
          customer: customerId,
          amount: params.amount,
          currency: params.currency || 'usd',
          description: params.description || 'Training services',
        });
        
        // Finalize the invoice
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
        
        // Send the invoice
        const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);
        
        // Update the invoice in our database
        if (params.invoiceId) {
          await supabase.from('invoices').update({
            stripe_invoice_id: sentInvoice.id,
            payment_link: sentInvoice.hosted_invoice_url,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', params.invoiceId);
        }
        
        result = {
          invoice_id: sentInvoice.id,
          invoice_url: sentInvoice.hosted_invoice_url,
          status: sentInvoice.status
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
