import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      throw new Error('Payment service not configured');
    }

    const { email, name, amount, items, callback_url } = await req.json();

    console.log('Initializing Paystack payment:', { email, amount, items_count: items?.length });

    // Validate inputs
    if (!email || !amount) {
      throw new Error('Email and amount are required');
    }

    // Initialize transaction with Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount), // Amount in kobo/cents
        currency: 'USD',
        callback_url,
        metadata: {
          customer_name: name,
          items: items,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: name
            }
          ]
        }
      }),
    });

    const data = await response.json();
    console.log('Paystack response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return new Response(JSON.stringify(data.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Paystack checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
