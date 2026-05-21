import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_WINDOWS_URL =
  "https://github.com/Kortezbis/DeskApp-Vis/releases/latest/download/Viszmo-Setup.exe";

type Product = "windows" | "ios" | "desktop" | "mac-waitlist";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_IOS_APP_STORE_URL =
  "https://apps.apple.com/us/app/viszmo-ai-study-flashcards/id6760960261";

/** When RESEND_FROM secret is unset, use verified domain (overridable per environment). */
const DEFAULT_RESEND_FROM = "Viszmo <noreply@mail.viszmo.com>";

function windowsInstallerUrl(): string {
  return Deno.env.get("WINDOWS_INSTALLER_URL")?.trim() ?? DEFAULT_WINDOWS_URL;
}

function resolveDownloadUrl(product: Product): { url: string; label: string } | null {
  if (product === "mac-waitlist") {
    return {
      url: "https://www.viszmo.com",
      label: "Viszmo for Mac",
    };
  }
  if (product === "windows" || product === "desktop") {
    return {
      url: windowsInstallerUrl(),
      label: "Viszmo for Windows",
    };
  }
  const ios = Deno.env.get("IOS_APP_STORE_URL")?.trim() ?? DEFAULT_IOS_APP_STORE_URL;
  if (!ios) {
    return null;
  }
  return { url: ios, label: "Viszmo on the App Store" };
}

function buildDownloadEmailHtml(
  product: Product,
  url: string,
  label: string,
): { subject: string; html: string } {
  const year = new Date().getFullYear();

  if (product === "mac-waitlist") {
    return {
      subject: "You're on the Viszmo Mac Waitlist! 🚀",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the Viszmo Mac Waitlist</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#1e293b;background-color:#f8fafc;padding:40px 20px;margin:0;">
  <div style="max-width:540px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:40px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://www.viszmo.com/viszmofull.png" alt="Viszmo Logo" style="width:130px;height:auto;display:inline-block;" />
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#f0f9ff;color:#0284c7;font-size:32px;line-height:1;padding:12px;border-radius:18px;margin-bottom:16px;">🚀</div>
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;letter-spacing:-0.02em;">You're on the Mac list!</h1>
      <p style="font-size:15px;color:#64748b;margin:0;">We will notify you the second macOS launches.</p>
    </div>
    <div style="font-size:15px;color:#334155;margin-bottom:32px;">
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">Thank you for your interest in <strong>Viszmo for Mac</strong>. We are building the macOS desktop app now and will email you as soon as it is ready to download.</p>
      <p style="margin:0 0 16px;">While you wait, you can use Viszmo on:</p>
      <ul style="padding-left:20px;margin:0 0 16px;color:#475569;">
        <li style="margin-bottom:8px;"><strong>Windows 10 & 11</strong> — desktop app available today</li>
        <li style="margin-bottom:8px;"><strong>iPhone & iPad</strong> — <a href="${DEFAULT_IOS_APP_STORE_URL}" style="color:#0ea5e9;text-decoration:none;font-weight:600;">App Store</a></li>
        <li style="margin-bottom:8px;"><strong>Web dashboard</strong> — flashcards, notes, and study tools at <a href="https://www.viszmo.com" style="color:#0ea5e9;text-decoration:none;font-weight:600;">viszmo.com</a></li>
      </ul>
    </div>
    <div style="text-align:center;margin-bottom:32px;padding:20px;background-color:#f8fafc;border-radius:16px;">
      <a href="https://www.viszmo.com" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;box-shadow:0 4px 12px rgba(14, 165, 233, 0.2);">Visit Viszmo Website</a>
    </div>
    <div style="border-top:1px solid #e2e8f0;padding-top:24px;text-align:center;font-size:12px;color:#94a3b8;">
      <p style="margin:0 0 4px;">&copy; ${year} Viszmo. All rights reserved.</p>
      <p style="margin:0;">Questions? <a href="mailto:support@viszmo.com" style="color:#0ea5e9;text-decoration:none;">support@viszmo.com</a></p>
    </div>
  </div>
</body>
</html>`,
    };
  }

  if (product === "ios") {
    return {
      subject: "Your Viszmo App Store link",
      html: buildLinkEmailHtml({
        year,
        label,
        url,
        headline: "Get Viszmo on your iPhone or iPad",
        intro:
          "Here is the App Store link you requested. Tap the button below on your phone to install Viszmo.",
        buttonText: "Open App Store",
      }),
    };
  }

  return {
    subject: "Your Viszmo for Windows download link",
    html: buildLinkEmailHtml({
      year,
      label,
      url,
      headline: "Download Viszmo for Windows",
      intro:
        "Open this email on your PC and tap the button below to download the installer. Run <strong>Viszmo-Setup.exe</strong> and follow the setup steps. Viszmo for Mac is coming soon.",
      buttonText: "Download for Windows",
      showCopyUrl: false,
    }),
  };
}

function buildLinkEmailHtml(opts: {
  year: number;
  label: string;
  url: string;
  headline: string;
  intro: string;
  buttonText: string;
  showCopyUrl?: boolean;
}): string {
  const { year, label, url, headline, intro, buttonText, showCopyUrl = true } = opts;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#1e293b;background-color:#f8fafc;padding:40px 20px;margin:0;">
  <div style="max-width:540px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:40px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://www.viszmo.com/viszmofull.png" alt="Viszmo Logo" style="width:130px;height:auto;display:inline-block;" />
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 8px;letter-spacing:-0.02em;">${headline}</h1>
      <p style="font-size:14px;color:#64748b;margin:0;">${label}</p>
    </div>
    <div style="font-size:15px;color:#334155;margin-bottom:32px;">
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 24px;">${intro}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${url}" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;box-shadow:0 4px 12px rgba(14, 165, 233, 0.25);">${buttonText}</a>
      </div>
      ${
        showCopyUrl
          ? `<p style="font-size:13px;color:#64748b;margin:0 0 8px;">Or copy and paste this link into your browser:</p>
      <div style="background-color:#f1f5f9;border-radius:10px;padding:12px;font-family:monospace;font-size:12px;word-break:break-all;color:#475569;border:1px solid #e2e8f0;">
        ${url}
      </div>`
          : `<p style="font-size:13px;color:#64748b;margin:0;text-align:center;">The installer will download when you tap the button. Need help? Visit <a href="https://www.viszmo.com/help" style="color:#0ea5e9;text-decoration:none;font-weight:600;">viszmo.com/help</a>.</p>`
      }
    </div>
    <div style="border-top:1px solid #e2e8f0;padding-top:24px;text-align:center;font-size:12px;color:#94a3b8;">
      <p style="margin:0 0 4px;">&copy; ${year} Viszmo. All rights reserved.</p>
      <p style="margin:0;">Need help? <a href="mailto:support@viszmo.com" style="color:#0ea5e9;text-decoration:none;">support@viszmo.com</a></p>
    </div>
  </div>
</body>
</html>`;
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
    const rawProduct = typeof body.product === "string" ? body.product : "windows";
    const product: Product =
      rawProduct === "ios"
        ? "ios"
        : rawProduct === "desktop"
          ? "desktop"
          : rawProduct === "mac-waitlist"
            ? "mac-waitlist"
            : "windows";

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
      DEFAULT_RESEND_FROM;

    const { url, label } = resolved;
    const { subject, html } = buildDownloadEmailHtml(product, url, label);

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

    const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      let msg = "Failed to send email";
      const rawMessage = payload.message;
      if (typeof rawMessage === "string" && rawMessage.length > 0) {
        msg = rawMessage;
      } else if (Array.isArray(payload.errors)) {
        const parts = payload.errors.map((entry: unknown) => {
          if (entry && typeof entry === "object" && "message" in entry) {
            const m = (entry as { message: unknown }).message;
            return typeof m === "string" ? m : "";
          }
          return "";
        }).filter(Boolean);
        if (parts.length > 0) msg = parts.join(" ");
      }
      console.error("send-download-link Resend API:", res.status, JSON.stringify(payload));
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
