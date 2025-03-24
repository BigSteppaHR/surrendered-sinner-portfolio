
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    // Get SMTP configuration from environment variables
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT"));
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
    const DEFAULT_FROM = Deno.env.get("SMTP_DEFAULT_FROM") || "support@surrenderedsinner.com";

    // Print debugging information
    console.log("SMTP Configuration:");
    console.log(`SMTP_HOST: ${SMTP_HOST ? "Set" : "Not set"}`);
    console.log(`SMTP_PORT: ${SMTP_PORT ? "Set" : "Not set"}`);
    console.log(`SMTP_USER: ${SMTP_USER ? "Set" : "Not set"}`);
    console.log(`SMTP_PASSWORD: ${SMTP_PASSWORD ? "Set (length: " + (SMTP_PASSWORD?.length || 0) + ")" : "Not set"}`);
    console.log(`DEFAULT_FROM: ${DEFAULT_FROM}`);

    // Validate SMTP configuration
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
      console.error("Missing SMTP configuration");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing SMTP settings",
          missingConfig: {
            host: !SMTP_HOST,
            port: !SMTP_PORT,
            user: !SMTP_USER,
            password: !SMTP_PASSWORD
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse email request from request body
    const { to, subject, text, html, from = DEFAULT_FROM }: EmailRequest = await req.json();
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

    // Create SMTP client
    console.log(`Creating SMTP client with host: ${SMTP_HOST}, port: ${SMTP_PORT}`);
    const client = new SmtpClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASSWORD,
        },
      },
    });

    // Send email
    console.log(`Sending email to ${to} with subject "${subject}"`);
    const result = await client.send({
      from,
      to,
      subject,
      content: html ? html : undefined,
      html: html ? html : undefined,
      text: text ? text : undefined,
    });
    
    console.log("Email sent successfully, result:", JSON.stringify(result));
    
    // Close the connection
    await client.close();
    console.log("SMTP connection closed");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send email",
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
