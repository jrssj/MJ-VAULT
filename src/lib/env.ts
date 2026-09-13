export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
};

export function hasSupabaseEnv() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function requireSupabaseEnv() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error("Faltan las variables públicas de Supabase.");
  }
  return {
    url: publicEnv.supabaseUrl,
    anonKey: publicEnv.supabaseAnonKey,
  };
}
