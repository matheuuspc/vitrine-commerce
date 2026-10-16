import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") ?? "https://matheuuspc.github.io,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function response(body: Record<string, string>, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    },
  });
}

function databaseHeaders(serviceKey: string) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin") ?? "";
  if (!allowedOrigins.has(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
      },
    });
  }
  if (request.method !== "POST") {
    return response({ message: "Método não permitido." }, 405, origin);
  }

  let email: string;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return response({ message: "Dados inválidos." }, 400, origin);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response({ message: "Informe um e-mail válido." }, 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "Vitrine";
  if (!supabaseUrl || !serviceKey || !brevoApiKey || !senderEmail) {
    return response({ message: "O cadastro por e-mail ainda não está configurado." }, 503, origin);
  }

  const tableUrl = `${supabaseUrl}/rest/v1/newsletter_subscriptions`;
  const filter = `?email=eq.${encodeURIComponent(email)}&select=id`;
  try {
    const existing = await fetch(`${tableUrl}${filter}`, {
      headers: databaseHeaders(serviceKey),
    });
    if (!existing.ok) throw new Error("database lookup failed");
    if ((await existing.json()).length > 0) {
      return response({ message: "Este e-mail já está cadastrado." }, 200, origin);
    }

    const inserted = await fetch(tableUrl, {
      method: "POST",
      headers: { ...databaseHeaders(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify({ email }),
    });
    if (inserted.status === 409) {
      return response({ message: "Este e-mail já está cadastrado." }, 200, origin);
    }
    if (!inserted.ok) throw new Error("database insert failed");

    const sent = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: "Boas-vindas à Vitrine",
        textContent: "Seu e-mail foi cadastrado para receber novidades e ofertas da Vitrine. Se você não solicitou este cadastro, ignore esta mensagem.",
      }),
    });
    if (!sent.ok) {
      await fetch(`${tableUrl}?email=eq.${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: databaseHeaders(serviceKey),
      });
      console.error("Brevo rejected newsletter message", sent.status);
      return response({ message: "Não foi possível enviar o e-mail agora. Tente novamente mais tarde." }, 503, origin);
    }

    return response({ message: "Cadastro realizado. Enviamos um e-mail de boas-vindas." }, 201, origin);
  } catch (error) {
    console.error("Newsletter signup failed", error instanceof Error ? error.message : "unknown error");
    return response({ message: "Não foi possível concluir o cadastro agora." }, 503, origin);
  }
});
