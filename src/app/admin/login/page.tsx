import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/admin/actions";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const error = (await searchParams).error;
  const isDevWithoutSupabase =
    process.env.NODE_ENV === "development" && !hasSupabaseEnv();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-[#12110f] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="display text-4xl">
          MJ <span className="text-[var(--gold-soft)]">Vault</span>
        </Link>
        <div>
          <p className="eyebrow text-[var(--gold-soft)]">Administración</p>
          <h1 className="display mt-4 max-w-xl text-7xl leading-[.9]">
            Tu boutique, bajo control.
          </h1>
        </div>
        <p className="text-sm text-white/45">Acceso exclusivo para la propietaria.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="display text-3xl lg:hidden">
            MJ Vault
          </Link>
          <p className="eyebrow mt-12 text-[var(--gold)] lg:mt-0">Área privada</p>
          <h2 className="display mt-3 text-5xl">Iniciar sesión</h2>
          <p className="muted mt-3 text-sm">
            Gestiona productos, inventario, pedidos y contenido.
          </p>
          {isDevWithoutSupabase && (
            <div className="mt-4 border hairline bg-amber-50/80 p-3 text-xs text-amber-900">
              <p className="font-semibold uppercase tracking-wider text-amber-800">
                Modo local de desarrollo
              </p>
              <p className="mt-1">
                Puedes entrar al panel localmente con estas credenciales:
              </p>
              <p className="mt-1">
                Correo: <strong className="font-mono">admin@mjvault.com</strong>
              </p>
              <p>
                Contraseña: <strong className="font-mono">admin123456</strong>
              </p>
            </div>
          )}
          {error && (
            <div className="mt-6 border border-[var(--danger)] bg-red-50 p-4 text-sm text-[var(--danger)]">
              {error === "sin-permiso"
                ? "Esta cuenta no tiene permisos administrativos."
                : "El correo o la contraseña no son correctos."}
            </div>
          )}
          <form action={loginAction} className="mt-8 grid gap-5">
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={isDevWithoutSupabase ? "admin@mjvault.com" : ""}
                required
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                defaultValue={isDevWithoutSupabase ? "admin123456" : ""}
                required
                className="input"
              />
            </div>
            <button className="button-primary mt-2">Entrar</button>
          </form>
          <Link href="/" className="mt-8 inline-block text-sm underline">
            Volver a la tienda
          </Link>
        </div>
      </section>
    </main>
  );
}

