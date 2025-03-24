
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Make sure we have the required env variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase URL or service role key')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the request body
    const { email, userId } = await req.json()

    if (!email && !userId) {
      throw new Error('Email or userId is required')
    }

    let user
    
    // Find the user by ID or email
    if (userId) {
      console.log(`Looking up user by ID: ${userId}`)
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (error) {
        throw error
      }
      
      user = data.user
    } else {
      console.log(`Looking up user by email: ${email}`)
      // Find the user by email
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        throw error
      }
      
      user = data.users.find(u => u.email === email)
    }

    if (!user) {
      throw new Error('User not found')
    }

    console.log(`Found user: ${user.id} (${user.email})`)

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      console.log('Email already confirmed at:', user.email_confirmed_at)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email already confirmed',
          userId: user.id,
          email: user.email,
          confirmedAt: user.email_confirmed_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set email_confirmed_at to now
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    )

    if (error) {
      throw error
    }

    console.log('Successfully confirmed email for user:', user.id)

    // Also update the profile
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          email_confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    } catch (profileErr) {
      console.error('Exception updating profile:', profileErr)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email confirmed successfully',
        userId: user.id,
        email: user.email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
