
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get contact form data
    const { name, email, phone, subject, message } = await req.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error('Missing required fields');
    }
    
    console.log(`Processing contact form submission from ${name} (${email})`);
    
    // Here you would typically send an email using a service like Resend, SendGrid, etc.
    // For now, we'll just log the data and return success
    // In a real implementation, you would add the email sending logic here
    
    console.log('Contact form details:', {
      name,
      email,
      phone: phone || 'Not provided',
      subject,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : '') // Log truncated message
    });
    
    // Example of email format that would be sent (commented out for now)
    /*
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-line;">${message}</p>
    `;
    
    // Send email using your preferred email service
    // await sendEmail({
    //   to: 'admin@surrenderedsinnerfitness.com',
    //   subject: `New Contact Form: ${subject}`,
    //   html: emailHtml
    // });
    */
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submission processed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred processing the contact form' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
