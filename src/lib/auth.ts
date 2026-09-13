import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function requireAdmin(): Promise<{
  supabase: SupabaseServerClient;
  user: { id: string; email?: string };
}> {
  if (!hasSupabaseEnv()) {
    const cookieStore = await cookies();
    const devSession = cookieStore.get("mj_dev_admin_session")?.value;
    if (process.env.NODE_ENV === "development" && devSession === "true") {
      const emptySupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: null, error: null }) }),
            order: () => ({ limit: async () => ({ data: [] }) }),
          }),
          insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error("Sin Supabase") }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error("Sin Supabase") }) }) }) }),
          delete: () => ({ eq: async () => ({ error: null }) }),
        }),
        rpc: async () => ({ data: null, error: new Error("Sin Supabase") }),
        storage: {
          from: () => ({
            upload: async () => ({ data: null, error: new Error("Sin Supabase") }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
          }),
        },
      };
      return {
        supabase: emptySupabase as unknown as SupabaseServerClient,
        user: { id: "dev-admin-id", email: "admin@mjvault.com" },
      };
    }
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/admin/login?error=sin-permiso");
  return { supabase, user };
}

