import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_WINDOWS_URL =
  "https://github.com/Kortezbis/DeskApp-Vis/releases/latest/download/Viszmo-Setup.exe";

type Product = "windows" | "ios";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveDownloadUrl(product: Product): { url: string; label: string } | null {
  if (product === "windows") {
    return {
      url: Deno.env.get("WINDOWS_INSTALLER_URL") ?? DEFAULT_WINDOWS_URL,
      label: "Viszmo for Windows",
    };
  }
  const ios = Deno.env.get("IOS_APP_STORE_URL")?.trim();
  if (!ios) {
    return null;
  }
  return { url: ios, label: "Viszmo on the App Store" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("send-download-link: missing RESEND_API_KEY");
    return new Response(JSON.stringify({ error: "Email is not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const product = body.product === "ios" ? "ios" : "windows";

    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resolved = resolveDownloadUrl(product);
    if (!resolved) {
      return new Response(
        JSON.stringify({
          error: "App Store link is not configured yet. Set IOS_APP_STORE_URL in project secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const from =
      Deno.env.get("RESEND_FROM")?.trim() ??
      "Viszmo <onboarding@resend.dev>";

    const { url, label } = resolved;
    const subject =
      product === "windows"
        ? "Your Viszmo download link"
        : "Your Viszmo App Store link";

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;padding:24px;max-width:560px;margin:0 auto;">
  <p style="margin:0 0 16px;">Hi,</p>
  <p style="margin:0 0 16px;">Here is the link you requested for <strong>${label}</strong>:</p>
  <p style="margin:0 0 24px;">
    <a href="${url}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;">Open download</a>
  </p>
  <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Or copy this URL:</p>
  <p style="margin:0;font-size:13px;word-break:break-all;color:#334155;">${url}</p>
  <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">— Viszmo</p>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        typeof (payload as { message?: string }).message === "string"
          ? (payload as { message: string }).message
          : "Failed to send email";
      console.error("Resend error:", res.status, payload);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    console.error("send-download-link:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
