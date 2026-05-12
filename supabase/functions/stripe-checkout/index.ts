import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const PLANS = {
  weekly: { priceId: "price_1TUjayIaAtXoqGKDiGxGl17D", productId: "prod_UTgypEDlzeU4zM", planName: "weekly" },
  plus_monthly: { priceId: "price_1TULbPIaAtXoqGKDOhVGUQ9B", productId: "prod_UTIBccZDue2ciX", planName: "plus" },
  plus_yearly: { priceId: "price_1TUjr3IaAtXoqGKDvBZjFvc6", productId: "prod_UThFfHZiHu85SE", planName: "plus" },
  pro_monthly: { priceId: "price_1TULdTIaAtXoqGKDeux08PiV", productId: "prod_UTIDNLwKoKql16", planName: "pro" },
  pro_yearly: { priceId: "price_1TUjrzIaAtXoqGKDwOddlN6G", productId: "prod_UThG8UtbykYX4V", planName: "pro" },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planId, userId, userEmail, successUrl, cancelUrl } = await req.json();

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) throw new Error("Invalid plan ID");

    console.log(`Creating checkout session for plan: ${planId}, user: ${userId}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        plan: plan.planName,
      },
      // This metadata ensures RevenueCat can track the Stripe subscription
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    });
  }
});
