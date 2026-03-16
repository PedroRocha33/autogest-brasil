import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    // Client with user's token to verify identity
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    // Check caller is admin
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!callerRole || !["admin", "gerente"].includes(callerRole.role)) {
      throw new Error("Apenas admins podem convidar membros");
    }

    // Get caller's tenant
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();

    if (!callerProfile?.tenant_id) throw new Error("Sem revenda vinculada");

    // Check tenant plan is marketplace
    const { data: tenant } = await adminClient
      .from("tenants")
      .select("plan")
      .eq("id", callerProfile.tenant_id)
      .single();

    if (tenant?.plan !== "marketplace") {
      throw new Error("Recurso disponível apenas no plano Marketplace");
    }

    const { email, name, role, commission_rate } = await req.json();

    if (!email || !name || !role) {
      throw new Error("Email, nome e cargo são obrigatórios");
    }

    if (!["vendedor", "gerente"].includes(role)) {
      throw new Error("Cargo inválido");
    }

    // Create auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!",
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) {
      if (createError.message.includes("already been registered")) {
        throw new Error("Este e-mail já está cadastrado");
      }
      throw createError;
    }

    // Create profile linked to same tenant
    await adminClient.from("profiles").upsert({
      user_id: newUser.user.id,
      name,
      email,
      tenant_id: callerProfile.tenant_id,
      commission_rate: commission_rate || 5.0,
    }, { onConflict: "user_id" });

    // Assign role
    await adminClient.from("user_roles").upsert({
      user_id: newUser.user.id,
      role,
    }, { onConflict: "user_id,role" });

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
