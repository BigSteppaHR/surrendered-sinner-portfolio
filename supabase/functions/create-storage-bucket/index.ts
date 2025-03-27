
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
    // Get the bucket name from the request
    const { bucketName, isPublic } = await req.json();
    
    if (!bucketName) {
      throw new Error("Bucket name is required");
    }
    
    console.log(`Creating storage bucket: ${bucketName}, public: ${isPublic}`);
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if bucket already exists
    const { data: existingBuckets, error: getBucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (getBucketsError) {
      console.error("Error checking existing buckets:", getBucketsError);
      throw getBucketsError;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      
      // Update bucket if needed
      if (isPublic !== undefined) {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
          public: isPublic
        });
        
        if (updateError) {
          console.error(`Error updating bucket ${bucketName}:`, updateError);
          throw updateError;
        }
        
        console.log(`Bucket ${bucketName} updated successfully`);
      }
    } else {
      // Create the bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic ?? false
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    }
    
    // Return success response with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        message: bucketExists ? "Bucket already exists" : "Bucket created successfully",
        bucketName
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
    console.error("Error in create-storage-bucket function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create storage bucket",
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
