
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
  });

  try {
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing signature or webhook secret' }), { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      // Handle successful subscription creation
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const userId = session.metadata?.user_id;
          const planId = session.metadata?.plan_id;
          const planType = session.metadata?.plan_type;
          
          if (!userId) {
            throw new Error('No user_id in metadata');
          }

          // Update payment history with successful status
          await supabase
            .from('payment_history')
            .update({ 
              status: 'completed',
              payment_method: 'stripe'
            })
            .eq('metadata->checkout_session_id', session.id);

          // Create or update subscription record
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          if (!existingSub) {
            await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                plan_id: planId,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                metadata: {
                  plan_type: planType,
                  has_addons: session.metadata?.has_addons || 'false',
                  checkout_session_id: session.id
                }
              });
          }

          // Process any addons purchased with the subscription
          const addonsData = session.metadata?.addons;
          if (addonsData) {
            try {
              const addons = JSON.parse(addonsData);
              if (Array.isArray(addons) && addons.length > 0) {
                // Insert addon purchases
                const addonPurchases = addons.map(addon => ({
                  user_id: userId,
                  addon_id: addon.id,
                  subscription_id: subscription.id,
                  status: 'active',
                  metadata: {
                    checkout_session_id: session.id,
                    price_paid: addon.price
                  }
                }));
                
                if (addonPurchases.length > 0) {
                  await supabase
                    .from('user_addon_purchases')
                    .insert(addonPurchases);
                }
              }
            } catch (error) {
              console.error('Error processing addons metadata:', error);
            }
          }

          // Update custom_plan_results if this was a quiz result purchase
          if (session.metadata?.quiz_result_id) {
            await supabase
              .from('custom_plan_results')
              .update({
                is_purchased: true,
                purchase_date: new Date().toISOString()
              })
              .eq('id', session.metadata.quiz_result_id);
          }

          // Create user notification about successful subscription
          await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              title: 'Subscription Activated',
              message: `Your ${planType} subscription has been successfully activated.`,
              notification_type: 'success',
              action_url: '/dashboard/plans'
            });
        }
        break;
      }
      
      // Handle subscription updates
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`Subscription updated: ${subscription.id}`);
        
        // Find the associated user
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subData) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
          
          // If subscription was canceled or renewed, send notification
          if (subscription.cancel_at_period_end) {
            await supabase
              .from('user_notifications')
              .insert({
                user_id: subData.user_id,
                title: 'Subscription Change',
                message: 'Your subscription will end after the current billing period.',
                notification_type: 'info',
                action_url: '/dashboard/plans'
              });
          } else if (event.data.previous_attributes?.cancel_at_period_end === true) {
            await supabase
              .from('user_notifications')
              .insert({
                user_id: subData.user_id,
                title: 'Subscription Renewed',
                message: 'Your subscription has been successfully renewed!',
                notification_type: 'success',
                action_url: '/dashboard/plans'
              });
          }
        }
        break;
      }
      
      // Handle subscription cancelation
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Subscription deleted: ${subscription.id}`);
        
        // Find the associated user
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subData) {
          // Update subscription status to canceled
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
          
          // Send notification to user
          await supabase
            .from('user_notifications')
            .insert({
              user_id: subData.user_id,
              title: 'Subscription Ended',
              message: 'Your subscription has ended. We hope you enjoyed our services!',
              notification_type: 'info',
              action_url: '/plans-catalog'
            });
        }
        break;
      }
      
      // Handle payment failures
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`Invoice payment failed: ${invoice.id}`);
        
        if (invoice.customer && invoice.subscription) {
          // Find the customer and associated user
          const { data: customers } = await stripe.customers.list({
            limit: 1,
            expand: ['data.subscriptions'],
            customer: invoice.customer as string
          });
          
          if (customers && customers.length > 0) {
            const customer = customers[0];
            
            // Find user ID from Stripe customer metadata
            const { data: stripeCustomer } = await supabase
              .from('stripe_customers')
              .select('user_id')
              .eq('stripe_customer_id', customer.id)
              .single();
            
            if (stripeCustomer) {
              // Create payment failure record
              await supabase
                .from('payment_history')
                .insert({
                  user_id: stripeCustomer.user_id,
                  amount: invoice.amount_due / 100, // Convert from cents
                  currency: invoice.currency,
                  status: 'failed',
                  payment_method: 'stripe',
                  description: 'Failed subscription payment',
                  metadata: {
                    invoice_id: invoice.id,
                    subscription_id: invoice.subscription
                  }
                });
              
              // Send notification to user
              await supabase
                .from('user_notifications')
                .insert({
                  user_id: stripeCustomer.user_id,
                  title: 'Payment Failed',
                  message: 'Your recent subscription payment failed. Please update your payment method.',
                  notification_type: 'error',
                  action_url: '/dashboard/payment'
                });
            }
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
