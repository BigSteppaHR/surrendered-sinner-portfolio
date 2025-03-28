
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.13.0";

// Use Supabase service role key to bypass RLS policies
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // This is your Stripe CLI webhook secret for testing
  const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  // Handle missing secret
  if (!stripeWebhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env var');
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const signature = req.headers.get('stripe-signature');
  
  // Handle missing signature
  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response(
      JSON.stringify({ error: 'Missing stripe signature' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get request body
  const body = await req.text();
  let event;

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Handle the event
  console.log(`Processing webhook event: ${event.type}`);
  
  try {
    switch (event.type) {
      // Payment events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      // Subscription events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      // Default case - log but don't handle
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(`Error handling webhook event: ${err.message}`);
    return new Response(
      JSON.stringify({ error: `Error handling webhook: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Helper to make API calls to our Supabase backend
async function supabaseAdmin(
  path: string, 
  method: string = 'GET', 
  body: any = null
) {
  const url = `${supabaseUrl}${path}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  
  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${text}`);
  }
  
  if (response.status !== 204) { // 204 = No Content
    return await response.json();
  }
  return null;
}

// Create admin notification
async function createAdminNotification(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  source: string,
  actionUrl: string = ''
) {
  try {
    await supabaseAdmin(
      '/rest/v1/admin_notifications',
      'POST',
      {
        title,
        message,
        notification_type: type,
        source,
        action_url: actionUrl,
        created_at: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('PaymentIntent succeeded:', paymentIntent.id);
  
  // Check if this payment is linked to our payment records
  if (paymentIntent.metadata?.payment_id) {
    const paymentId = paymentIntent.metadata.payment_id;
    
    try {
      // Update payment status in our database
      await supabaseAdmin(
        `/rest/v1/payments?id=eq.${paymentId}`,
        'PATCH',
        {
          status: 'completed',
          payment_intent_id: paymentIntent.id,
          payment_method: paymentIntent.payment_method_types[0],
          completed_at: new Date().toISOString(),
          metadata: {
            ...paymentIntent.metadata,
            amount_cents: paymentIntent.amount,
            payment_method_details: JSON.stringify(paymentIntent.payment_method_details)
          }
        }
      );
      
      // Get payment to find user
      const payments = await supabaseAdmin(
        `/rest/v1/payments?id=eq.${paymentId}&select=*`
      );
      
      if (payments && payments.length > 0) {
        const payment = payments[0];
        
        // If we have a user_id, create notification
        if (payment.user_id) {
          await supabaseAdmin(
            '/rest/v1/user_notifications',
            'POST',
            {
              user_id: payment.user_id,
              title: 'Payment Successful',
              message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has been processed successfully.`,
              notification_type: 'success',
              is_read: false
            }
          );
          
          // Update user balance if necessary
          if (payment.metadata?.add_to_balance) {
            // Get current balance
            const profiles = await supabaseAdmin(
              `/rest/v1/profiles?id=eq.${payment.user_id}&select=balance`
            );
            
            if (profiles && profiles.length > 0) {
              const currentBalance = profiles[0].balance || 0;
              const newBalance = currentBalance + (paymentIntent.amount / 100); // Convert cents to dollars
              
              await supabaseAdmin(
                `/rest/v1/profiles?id=eq.${payment.user_id}`,
                'PATCH',
                { balance: newBalance }
              );
            }
          }
        }
        
        // Create admin notification
        await createAdminNotification(
          'Payment Successful',
          `Payment of $${(paymentIntent.amount / 100).toFixed(2)} completed (ID: ${paymentId})`,
          'success',
          'stripe-webhook',
          '/admin/payments'
        );
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('PaymentIntent failed:', paymentIntent.id);
  
  if (paymentIntent.metadata?.payment_id) {
    const paymentId = paymentIntent.metadata.payment_id;
    
    try {
      // Update payment status in database
      await supabaseAdmin(
        `/rest/v1/payments?id=eq.${paymentId}`,
        'PATCH',
        {
          status: 'failed',
          payment_intent_id: paymentIntent.id,
          metadata: {
            ...paymentIntent.metadata,
            error: paymentIntent.last_payment_error?.message || 'Payment failed'
          }
        }
      );
      
      // Get payment to find user
      const payments = await supabaseAdmin(
        `/rest/v1/payments?id=eq.${paymentId}&select=*`
      );
      
      if (payments && payments.length > 0) {
        const payment = payments[0];
        
        // If we have a user_id, create notification
        if (payment.user_id) {
          await supabaseAdmin(
            '/rest/v1/user_notifications',
            'POST',
            {
              user_id: payment.user_id,
              title: 'Payment Failed',
              message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} failed. Reason: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
              notification_type: 'error',
              is_read: false
            }
          );
        }
        
        // Create admin notification
        await createAdminNotification(
          'Payment Failed',
          `Payment of $${(paymentIntent.amount / 100).toFixed(2)} failed (ID: ${paymentId})`,
          'error',
          'stripe-webhook',
          '/admin/payments'
        );
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);
  
  // Extract user ID from metadata
  const userId = subscription.metadata?.user_id;
  const subscriptionId = subscription.metadata?.subscription_id;
  const quizResultId = subscription.metadata?.quiz_result_id;
  
  if (userId && subscriptionId) {
    try {
      // Create or update subscription record
      await supabaseAdmin(
        `/rest/v1/user_subscription_purchases`,
        'POST',
        {
          user_id: userId,
          subscription_id: subscriptionId,
          quiz_result_id: quizResultId || null,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      // Create user notification
      if (userId) {
        await supabaseAdmin(
          '/rest/v1/user_notifications',
          'POST',
          {
            user_id: userId,
            title: 'Subscription Started',
            message: 'Your subscription has been created successfully.',
            notification_type: 'success',
            is_read: false
          }
        );
      }
      
      // Create admin notification
      await createAdminNotification(
        'New Subscription',
        `User ${userId} has created a new subscription (ID: ${subscription.id})`,
        'info',
        'stripe-webhook',
        '/admin/subscriptions'
      );
    } catch (error) {
      console.error('Error handling subscription creation:', error);
    }
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id);
  
  try {
    // Find our subscription record
    const subs = await supabaseAdmin(
      `/rest/v1/user_subscription_purchases?stripe_subscription_id=eq.${subscription.id}&select=*`
    );
    
    if (subs && subs.length > 0) {
      const sub = subs[0];
      
      // Update our record with new status and dates
      await supabaseAdmin(
        `/rest/v1/user_subscription_purchases?id=eq.${sub.id}`,
        'PATCH',
        {
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      // If subscription status changed, notify user
      if (sub.status !== subscription.status) {
        if (subscription.status === 'active' && sub.status !== 'active') {
          await supabaseAdmin(
            '/rest/v1/user_notifications',
            'POST',
            {
              user_id: sub.user_id,
              title: 'Subscription Activated',
              message: 'Your subscription is now active.',
              notification_type: 'success',
              is_read: false
            }
          );
        } else if (subscription.status === 'canceled' || subscription.status === 'cancelled') {
          await supabaseAdmin(
            '/rest/v1/user_notifications',
            'POST',
            {
              user_id: sub.user_id,
              title: 'Subscription Cancelled',
              message: 'Your subscription has been cancelled.',
              notification_type: 'info',
              is_read: false
            }
          );
        } else if (subscription.status === 'past_due') {
          await supabaseAdmin(
            '/rest/v1/user_notifications',
            'POST',
            {
              user_id: sub.user_id,
              title: 'Payment Past Due',
              message: 'Your subscription payment is past due. Please update your payment method.',
              notification_type: 'warning',
              is_read: false
            }
          );
        }
        
        // Create admin notification for important status changes
        if (['canceled', 'past_due', 'unpaid'].includes(subscription.status)) {
          await createAdminNotification(
            `Subscription ${subscription.status}`,
            `Subscription for user ${sub.user_id} is now ${subscription.status} (ID: ${subscription.id})`,
            'warning',
            'stripe-webhook',
            '/admin/subscriptions'
          );
        }
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id);
  
  try {
    // Find our subscription record
    const subs = await supabaseAdmin(
      `/rest/v1/user_subscription_purchases?stripe_subscription_id=eq.${subscription.id}&select=*`
    );
    
    if (subs && subs.length > 0) {
      const sub = subs[0];
      
      // Update our record
      await supabaseAdmin(
        `/rest/v1/user_subscription_purchases?id=eq.${sub.id}`,
        'PATCH',
        {
          status: 'cancelled',
          updated_at: new Date().toISOString()
        }
      );
      
      // Notify user
      await supabaseAdmin(
        '/rest/v1/user_notifications',
        'POST',
        {
          user_id: sub.user_id,
          title: 'Subscription Ended',
          message: 'Your subscription has ended.',
          notification_type: 'info',
          is_read: false
        }
      );
      
      // Create admin notification
      await createAdminNotification(
        'Subscription Ended',
        `Subscription for user ${sub.user_id} has ended (ID: ${subscription.id})`,
        'info',
        'stripe-webhook',
        '/admin/subscriptions'
      );
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    try {
      // Find subscription in our records
      const subs = await supabaseAdmin(
        `/rest/v1/user_subscription_purchases?stripe_subscription_id=eq.${invoice.subscription}&select=*`
      );
      
      if (subs && subs.length > 0) {
        const sub = subs[0];
        
        // Create payment record
        await supabaseAdmin(
          `/rest/v1/payments`,
          'POST',
          {
            user_id: sub.user_id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: 'completed',
            payment_method: invoice.payment_method_types[0] || 'card',
            payment_intent_id: invoice.payment_intent,
            metadata: {
              invoice_id: invoice.id,
              subscription_id: invoice.subscription,
              description: `Subscription payment for ${sub.subscription_id}`
            },
            completed_at: new Date().toISOString()
          }
        );
        
        // Notify user
        await supabaseAdmin(
          '/rest/v1/user_notifications',
          'POST',
          {
            user_id: sub.user_id,
            title: 'Payment Received',
            message: `We've received your payment of $${(invoice.amount_paid / 100).toFixed(2)} for your subscription.`,
            notification_type: 'success',
            is_read: false
          }
        );
      }
    } catch (error) {
      console.error('Error handling invoice payment:', error);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id);
  
  if (invoice.subscription) {
    try {
      // Find subscription in our records
      const subs = await supabaseAdmin(
        `/rest/v1/user_subscription_purchases?stripe_subscription_id=eq.${invoice.subscription}&select=*`
      );
      
      if (subs && subs.length > 0) {
        const sub = subs[0];
        
        // Notify user
        await supabaseAdmin(
          '/rest/v1/user_notifications',
          'POST',
          {
            user_id: sub.user_id,
            title: 'Payment Failed',
            message: `Your subscription payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
            notification_type: 'error',
            is_read: false,
            priority: 'high'
          }
        );
        
        // Create admin notification
        await createAdminNotification(
          'Subscription Payment Failed',
          `Payment for subscription ${invoice.subscription} failed (User: ${sub.user_id})`,
          'error',
          'stripe-webhook',
          '/admin/subscriptions'
        );
      }
    } catch (error) {
      console.error('Error handling invoice payment failure:', error);
    }
  }
}
