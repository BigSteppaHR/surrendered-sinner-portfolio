
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get the email from the request
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    console.log("Verifying email for:", email);
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Update the profile to mark email as confirmed
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ email_confirmed: true })
      .eq('email', email);
      
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    
    console.log("Email verified successfully for:", email);
    
    // Return success response with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email verified successfully",
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
    console.error("Error in set-email-verified function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to verify email",
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
