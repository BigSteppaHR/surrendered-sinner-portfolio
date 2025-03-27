
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers - allow any origin or use environment variable if set
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { to, subject, text, html, from, domain, origin } = await req.json();
    
    console.log("Email request received from:", origin || domain || 'unknown origin');
    console.log("Sending email to:", to, "with subject:", subject);

    // For development, simulate successful email sending
    // In production, you would integrate with a real email service
    
    // Return success response with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email processed successfully",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process email request",
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
});
