
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }
  
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Create buckets if they don't exist
    const buckets = [
      {
        id: 'profile-pictures',
        name: 'Profile Pictures',
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      },
      {
        id: 'weight-images',
        name: 'Weight Images',
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      }
    ]
    
    const results = []
    
    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket, error: checkError } = await supabase
          .storage
          .getBucket(bucket.id)
        
        if (checkError && !existingBucket) {
          // Create bucket if it doesn't exist
          const { data, error } = await supabase
            .storage
            .createBucket(bucket.id, {
              public: bucket.public,
              fileSizeLimit: bucket.fileSizeLimit,
              allowedMimeTypes: bucket.allowedMimeTypes
            })
          
          if (error) {
            results.push({ bucket: bucket.id, status: 'error', message: error.message })
          } else {
            results.push({ bucket: bucket.id, status: 'created', data })
            
            // Create RLS policies for the bucket
            await supabase.rpc('create_storage_policies', {
              bucket_name: bucket.id,
              is_public: bucket.public
            }).catch(e => {
              console.error(`Error creating policies for ${bucket.id}:`, e)
            })
          }
        } else {
          // Update existing bucket
          const { data, error } = await supabase
            .storage
            .updateBucket(bucket.id, {
              public: bucket.public,
              fileSizeLimit: bucket.fileSizeLimit,
              allowedMimeTypes: bucket.allowedMimeTypes
            })
          
          if (error) {
            results.push({ bucket: bucket.id, status: 'error_update', message: error.message })
          } else {
            results.push({ bucket: bucket.id, status: 'updated', data })
          }
        }
      } catch (bucketError) {
        results.push({ bucket: bucket.id, status: 'exception', message: bucketError.message })
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
