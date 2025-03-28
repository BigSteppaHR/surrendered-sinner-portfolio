
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.13.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Stripe with secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse request body
    const { action, params } = await req.json();
    console.log(`Processing ${action} with params:`, params);

    // Router for different actions
    switch (action) {
      case "test-connection":
        return handleTestConnection(stripe);
      case "get-dashboard-data":
        return handleGetDashboardData(stripe);
      case "createPaymentIntent":
        return handleCreatePaymentIntent(stripe, params);
      case "createSubscription":
        return handleCreateSubscription(stripe, params);
      case "updatePaymentStatus":
        return handleUpdatePaymentStatus(params);
      case "getSubscriptionDetails":
        return handleGetSubscriptionDetails(stripe, params);
      case "cancelSubscription":
        return handleCancelSubscription(stripe, params);
      case "checkSubscriptionStatus":
        return handleCheckSubscriptionStatus(stripe, params);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in stripe-helper function:`, error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleTestConnection(stripe: Stripe) {
  try {
    // Simply check if we can create a basic resource
    await stripe.customers.list({ limit: 1 });

    return new Response(
      JSON.stringify({
        status: "connected",
        message: "Successfully connected to Stripe API",
        stripeKeyAvailable: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Stripe API test connection failed:", error);
    return new Response(
      JSON.stringify({
        status: "disconnected",
        message: error.message,
        stripeKeyAvailable: !!Deno.env.get("STRIPE_SECRET_KEY"),
      }),
      {
        status: 200, // Still return 200 so we can check if the key is available
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleGetDashboardData(stripe: Stripe) {
  try {
    // Get basic Stripe account data
    const [balance, paymentIntents, customers, subscriptions, products] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.paymentIntents.list({ limit: 10 }),
      stripe.customers.list({ limit: 10 }),
      stripe.subscriptions.list({ status: 'active', limit: 10 }),
      stripe.products.list({ active: true, limit: 10 }),
    ]);

    return new Response(
      JSON.stringify({
        status: "connected",
        data: {
          balance,
          recentPayments: paymentIntents.data,
          customerCount: customers.data.length,
          activeSubscriptions: subscriptions.data.length,
          productCount: products.data.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching Stripe dashboard data:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleCreatePaymentIntent(stripe: Stripe, params: any) {
  try {
    const { amount, currency = "usd", payment_id, description } = params;

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!payment_id) {
      throw new Error("Missing payment_id parameter");
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and ensure integer
      currency,
      metadata: {
        payment_id,
        description: description || "Account balance top-up",
      },
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleCreateSubscription(stripe: Stripe, params: any) {
  try {
    const { 
      email, 
      name, 
      payment_method_id, 
      price_id,
      subscription_id, 
      user_id,
      quiz_result_id = null
    } = params;

    if (!email || !payment_method_id || !price_id || !user_id) {
      throw new Error("Missing required parameters");
    }

    // Check if customer already exists with this email
    const existingCustomers = await stripe.customers.list({ email });
    
    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      
      // Update customer if name provided
      if (name && name !== customer.name) {
        customer = await stripe.customers.update(customer.id, { name });
      }
      
      // Attach payment method to existing customer
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customer.id,
      });
    } else {
      // Create a new customer
      customer = await stripe.customers.create({
        email,
        name,
        payment_method: payment_method_id,
        metadata: {
          user_id
        }
      });
    }
    
    // Set default payment method 
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id,
        subscription_id,
        quiz_result_id
      }
    });
    
    // Record the subscription in our database
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/user_subscription_purchases`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          user_id,
          subscription_id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          quiz_result_id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error recording subscription in database:", errorText);
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleUpdatePaymentStatus(params: any) {
  try {
    const { 
      payment_id, 
      status, 
      payment_intent_id = null, 
      payment_method = null,
      amount = null,
      description = null
    } = params;

    if (!payment_id || !status) {
      throw new Error("Missing required parameters");
    }

    // Update payment record in database
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/payments?id=eq.${payment_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          status,
          payment_intent_id,
          payment_method,
          completed_at: status === "completed" ? new Date().toISOString() : null,
          metadata: {
            description,
            amount_cents: amount,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update payment status: ${errorText}`);
    }

    // For completed payments, also update user's balance
    if (status === "completed" && amount) {
      const paymentData = await response.json();
      
      if (paymentData.length > 0 && paymentData[0].user_id) {
        const userId = paymentData[0].user_id;
        
        // Get current balance
        const profileResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles?id=eq.${userId}&select=id,balance`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
            },
          }
        );
        
        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          throw new Error(`Failed to get user profile: ${errorText}`);
        }
        
        const profileData = await profileResponse.json();
        if (profileData.length > 0) {
          const currentBalance = profileData[0].balance || 0;
          const newBalance = currentBalance + (amount / 100); // Convert cents to dollars
          
          // Update user balance
          const updateResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles?id=eq.${userId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
              },
              body: JSON.stringify({
                balance: newBalance,
              }),
            }
          );
          
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error(`Failed to update user balance: ${errorText}`);
          }
          
          // Create notification for user
          const notificationResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/rest/v1/user_notifications`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
              },
              body: JSON.stringify({
                user_id: userId,
                title: "Payment Successful",
                message: `Your payment of $${(amount / 100).toFixed(2)} has been processed successfully. Your new account balance is $${newBalance.toFixed(2)}.`,
                notification_type: "success",
              }),
            }
          );
          
          if (!notificationResponse.ok) {
            const errorText = await notificationResponse.text();
            console.error(`Failed to create notification: ${errorText}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating payment status:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleGetSubscriptionDetails(stripe: Stripe, params: any) {
  try {
    const { subscription_id } = params;
    
    if (!subscription_id) {
      throw new Error("Missing subscription_id parameter");
    }
    
    const subscription = await stripe.subscriptions.retrieve(subscription_id, {
      expand: ['customer', 'items.data.price.product']
    });
    
    return new Response(
      JSON.stringify({
        subscription
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting subscription details:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleCancelSubscription(stripe: Stripe, params: any) {
  try {
    const { subscription_id, cancel_immediately = false } = params;
    
    if (!subscription_id) {
      throw new Error("Missing subscription_id parameter");
    }
    
    const subscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: !cancel_immediately
    });
    
    if (cancel_immediately) {
      await stripe.subscriptions.cancel(subscription_id);
    }
    
    // Update database record
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/user_subscription_purchases?stripe_subscription_id=eq.${subscription_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
        body: JSON.stringify({
          status: cancel_immediately ? 'cancelled' : 'cancelling',
          updated_at: new Date().toISOString()
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating subscription in database:", errorText);
    }
    
    return new Response(
      JSON.stringify({
        status: cancel_immediately ? 'cancelled' : 'cancelling',
        subscription
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleCheckSubscriptionStatus(stripe: Stripe, params: any) {
  try {
    const { user_id, subscription_id } = params;
    
    if (!user_id && !subscription_id) {
      throw new Error("Missing required parameters. Either user_id or subscription_id must be provided");
    }
    
    let query = '';
    let queryParams = {};
    
    if (subscription_id) {
      query = 'stripe_subscription_id=eq.' + subscription_id;
    } else {
      query = 'user_id=eq.' + user_id;
    }
    
    // Check database for subscription
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/user_subscription_purchases?${query}&select=*,subscription:subscription_id(*)`,
      {
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check subscription status: ${errorText}`);
    }
    
    const subscriptionData = await response.json();
    
    // If found in database, check with Stripe
    if (subscriptionData.length > 0) {
      const activeSubs = [];
      
      for (const sub of subscriptionData) {
        if (!sub.stripe_subscription_id) continue;
        
        try {
          const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
          
          // Update our record if status doesn't match
          if (stripeSub.status !== sub.status) {
            const updateResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/rest/v1/user_subscription_purchases?id=eq.${sub.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
                },
                body: JSON.stringify({
                  status: stripeSub.status,
                  current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString()
                }),
              }
            );
            
            if (!updateResponse.ok) {
              console.error("Error updating subscription status in database");
            }
            
            sub.status = stripeSub.status;
          }
          
          if (stripeSub.status === 'active' || stripeSub.status === 'trialing') {
            activeSubs.push({
              ...sub,
              stripe_details: stripeSub
            });
          }
        } catch (error) {
          console.error(`Error retrieving Stripe subscription ${sub.stripe_subscription_id}:`, error);
        }
      }
      
      return new Response(
        JSON.stringify({
          hasActiveSubscription: activeSubs.length > 0,
          subscriptions: subscriptionData,
          activeSubscriptions: activeSubs
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          hasActiveSubscription: false,
          subscriptions: []
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        hasActiveSubscription: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
