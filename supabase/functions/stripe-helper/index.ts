
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@13.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Create a Stripe client using the API key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Handle CORS preflight requests
const handleCors = (req: Request): Response | null => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Main request handler
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    console.log(`Stripe helper called with path: ${path}`);

    // Parse the request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    if (path === "create-payment-link") {
      // Create a payment link for invoices
      const { amount, description, customerEmail, customerName } = body;
      
      // Create a customer if email is provided
      let customer;
      if (customerEmail) {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customer = customers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            name: customerName || undefined,
          });
          customer = newCustomer.id;
        }
      }
      
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: description || "Fitness Training Services",
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
              tax_behavior: "exclusive",
            },
            quantity: 1,
          },
        ],
        customer: customer,
        automatic_tax: { enabled: true },
      });
      
      return new Response(JSON.stringify({ url: paymentLink.url }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (path === "get-dashboard-data") {
      // Get aggregated data for the admin dashboard
      const [customers, products, subscriptions, paymentIntents, invoices] = await Promise.all([
        stripe.customers.list({ limit: 100 }),
        stripe.products.list({ limit: 100, active: true }),
        stripe.subscriptions.list({ limit: 100, status: 'active' }),
        stripe.paymentIntents.list({ limit: 100 }),
        stripe.invoices.list({ limit: 100 }),
      ]);
      
      // Calculate subscription distribution
      const subDistribution = products.data.map(product => {
        const productSubs = subscriptions.data.filter(sub => {
          const items = sub.items.data;
          return items.some(item => {
            const price = item.price;
            return price.product === product.id;
          });
        });
        
        return {
          name: product.name,
          value: productSubs.length,
          color: '#' + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, '0'),
        };
      }).filter(item => item.value > 0);
      
      // Calculate revenue data by month
      const revenueByMonth = {};
      paymentIntents.data.forEach(pi => {
        if (pi.status === 'succeeded') {
          const date = new Date(pi.created * 1000);
          const month = date.toLocaleString('default', { month: 'short' });
          const amount = pi.amount / 100; // Convert from cents to dollars
          
          if (!revenueByMonth[month]) {
            revenueByMonth[month] = 0;
          }
          revenueByMonth[month] += amount;
        }
      });
      
      const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      }));
      
      // Calculate basic stats
      const totalCustomers = customers.data.length;
      const totalRevenue = paymentIntents.data
        .filter(pi => pi.status === 'succeeded')
        .reduce((sum, pi) => sum + (pi.amount / 100), 0);
      const averageInvoiceValue = totalRevenue / Math.max(invoices.data.length, 1);
      const activeSubscriptions = subscriptions.data
        .filter(sub => sub.status === 'active').length;
      
      const dashboardData = {
        stats: [
          {
            id: "total-customers",
            stat_name: "Total Customers",
            stat_value: totalCustomers,
            stat_change: 5.2, // This would ideally be calculated from historical data
            time_period: "monthly",
            is_positive: true,
            icon: "Users",
          },
          {
            id: "monthly-revenue",
            stat_name: "Monthly Revenue",
            stat_value: totalRevenue,
            stat_change: 8.4,
            time_period: "monthly",
            is_positive: true,
            icon: "DollarSign",
          },
          {
            id: "average-invoice",
            stat_name: "Average Invoice",
            stat_value: averageInvoiceValue,
            stat_change: 1.2,
            time_period: "monthly",
            is_positive: true,
            icon: "MessageSquare",
          },
          {
            id: "active-subscriptions",
            stat_name: "Active Subscriptions",
            stat_value: activeSubscriptions,
            stat_change: 4.6,
            time_period: "monthly",
            is_positive: true,
            icon: "Calendar",
          },
        ],
        subscriptionDistribution: subDistribution,
        revenueData: revenueData,
      };
      
      return new Response(JSON.stringify(dashboardData), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (path === "list-invoices") {
      const { limit = 100 } = body;
      const invoices = await stripe.invoices.list({ limit });
      
      const formattedInvoices = invoices.data.map(invoice => {
        let status = 'Pending';
        if (invoice.status === 'paid') status = 'Paid';
        if (invoice.status === 'uncollectible' || invoice.status === 'void') status = 'Overdue';
        
        return {
          id: invoice.id,
          customer: invoice.customer_name || 'Unknown',
          email: invoice.customer_email || 'No email provided',
          amount: `$${(invoice.total / 100).toFixed(2)}`,
          date: new Date(invoice.created * 1000).toISOString().split('T')[0],
          status,
        };
      });
      
      return new Response(JSON.stringify(formattedInvoices), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    return new Response(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in stripe-helper function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Start the HTTP server
serve(handler);
