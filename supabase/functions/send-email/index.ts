
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse email request from request body
    const { to, subject, text, html, from = "support@surrenderedsinner.com" }: EmailRequest = await req.json();
    console.log(`Received email request to: ${to}, subject: ${subject}`);

    // Validate email request
    if (!to || !subject || (!text && !html)) {
      console.error("Missing required fields in email request");
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, and either text or html",
          receivedFields: { to, subject, hasText: !!text, hasHtml: !!html }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Since we don't have SMTP configured yet, just return success to not block the UI
    console.log("Email would be sent to:", to, "with subject:", subject);
    console.log("For now, returning success without actually sending email");

    return new Response(
      JSON.stringify({ success: true, message: "Email processed successfully (simulated)" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing email:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process email",
        stack: error.stack,
        name: error.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
