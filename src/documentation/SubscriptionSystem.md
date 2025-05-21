
# Sinner Performance Subscription System Documentation

## Overview

The Sinner Performance subscription system provides personalized training programs to users based on their fitness level, goals, and enhancement protocols. The system includes customized plans, add-ons, and a quiz-based recommendation engine.

## System Architecture

The subscription system consists of the following key components:

1. **Frontend Components**
   - Subscription Plans Display
   - Custom Plan Quiz
   - Add-on Selection Interface
   - Checkout Process

2. **Backend Services**
   - Supabase Database (storing user data, quiz results, subscriptions)
   - Stripe Integration (payment processing)
   - Edge Functions (serverless functions for payment and webhook handling)

3. **Data Flow**
   - User takes quiz → System recommends plan → User selects plan and add-ons → User completes payment → Subscription activated

## Subscription Plans

### Plan Types

The system offers four main subscription plans:

1. **Beginner Plan ($150/month)**
   - For those new to structured training and nutrition planning
   - Includes personalized training program, basic nutrition guidance, form correction advice, monthly program updates, and email support

2. **Intermediate Plan ($175/month)**
   - For experienced lifters seeking optimized programming
   - Includes advanced periodized training, detailed nutrition protocols, recovery optimization, bi-weekly check-ins, priority email support, and supplement recommendations

3. **Advanced Enhancement Plan ($299/month)**
   - For athletes using performance enhancement requiring specialized protocols
   - Includes PED-optimized training protocols, cycle-specific nutrition planning, health marker monitoring guidance, weekly check-ins, 24/7 messaging support, advanced supplement protocols, and recovery recommendations

4. **Competition Prep Plan ($399/month)**
   - For bodybuilding competition preparation
   - Includes contest-specific training periodization, peak week protocols, stage presentation guidance, twice-weekly check-ins, posing feedback, custom carb cycling, 24/7 priority access, and post-show recovery planning

### Add-on Services

Users can enhance their subscription with the following add-on services:

1. **Nutrition Plan Revision ($35)**
   - Mid-month nutrition plan adjustments based on progress

2. **Training Program Revision ($40)**
   - Mid-month program adjustments based on feedback and progress

3. **Impromptu Coaching Session ($60)**
   - 30-minute coaching call for immediate guidance and support

4. **Progress Pictures Analysis ($45)**
   - Detailed feedback and analysis on progress pictures

5. **Posing Practice Session ($75)**
   - 45-minute posing practice and feedback for competitors

## User Flow

1. **Plan Discovery**
   - Users can view plans directly from the plans catalog page
   - Users can take a personalized quiz to receive plan recommendations

2. **Custom Plan Quiz**
   - Users answer questions about their experience level, goals, enhancement protocols, timeframe, and support needs
   - System analyzes responses and recommends the most suitable plan
   - Quiz results are stored in the database for authenticated users

3. **Plan Selection**
   - Users select their preferred plan from recommendations or catalog
   - Users can add optional add-ons to enhance their experience

4. **Checkout Process**
   - The system creates a Stripe checkout session
   - Users are redirected to Stripe to complete payment
   - Upon successful payment, users are redirected to a success page

5. **Subscription Management**
   - Users can view their active subscriptions in their dashboard
   - Plan details, renewal dates, and add-ons are displayed

## Backend Data Structure

### Database Tables

1. **custom_plan_results**
   - Stores quiz results and recommendations
   - Fields: user_id, quiz_answers, selected_plan_id, selected_plan_name, selected_plan_price, is_purchased

2. **subscriptions**
   - Stores active subscriptions
   - Fields: user_id, stripe_subscription_id, status, plan_id, current_period_start, current_period_end, metadata

3. **user_addon_purchases**
   - Tracks add-ons purchased by users
   - Fields: user_id, addon_id, subscription_id, status, purchase_date, is_used, used_date

### Edge Functions

1. **stripe-helper**
   - Creates checkout sessions
   - Retrieves payment history and subscriptions
   - Manages add-ons
   - Testing connection functionality

2. **stripe-webhook**
   - Processes Stripe events
   - Handles checkout session completion
   - Manages subscription lifecycle events
   - Processes payment failures

## Authentication Integration

The subscription system integrates with Supabase authentication to:
- Connect quiz results to logged-in users
- Track user subscriptions and purchases
- Enable personalized recommendations
- Secure payment processes

## Technical Implementation Details

### Frontend Components

1. **SubscriptionPlans.tsx**
   - Displays available plans
   - Handles plan selection and add-on customization
   - Initiates checkout process
   - Calculates total price

2. **SubscriptionData.tsx**
   - Contains plan and add-on data definitions
   - Structures plan features and pricing
   - Defines available add-ons for each plan

3. **CustomPlanQuiz.tsx**
   - Implements quiz interface
   - Processes user responses
   - Determines recommended plan
   - Saves results to database

### Edge Functions Implementation

1. **stripe-helper/index.ts**
   - Handles CORS
   - Authenticates user requests
   - Creates Stripe checkout sessions
   - Retrieves subscription data
   - Manages add-ons

2. **stripe-webhook/index.ts**
   - Verifies Stripe signatures
   - Processes checkout completion events
   - Handles subscription updates
   - Manages payment failures
   - Creates user notifications

## Error Handling

The system includes comprehensive error handling for:
- Authentication failures
- Payment processing issues
- Database operation failures
- Quiz data processing errors

## Testing

To test the system:
1. Create a Supabase account and configure environment variables
2. Set up Stripe test mode and API keys
3. Configure webhook endpoints
4. Use Stripe test cards to simulate payments

## Configuration

Required environment variables:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

## Security Considerations

- User authentication is required for subscription management
- Edge functions validate request authenticity
- Stripe webhook signatures are verified
- Service role key is used only in secure edge functions
- Sensitive data is stored in Supabase with appropriate RLS policies

## Future Enhancements

Potential system improvements include:
- Subscription cancellation and pause functionality
- Prorated plan upgrades/downgrades
- Discount codes and promotional pricing
- Referral program integration
- Enhanced analytics for subscription metrics
