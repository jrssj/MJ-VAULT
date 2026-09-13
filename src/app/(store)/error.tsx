"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error safely without leaking to customer UI
    console.error("Store error caught:", error.message);
  }, [error]);

  return (
    <main className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-amber-50 text-[var(--gold)]">
        <AlertCircle size={24} />
      </div>
      <p className="eyebrow text-[var(--gold)]">Experiencia de compra</p>
      <h1 className="display mt-2 text-4xl md:text-5xl">
        Un momento, no pudimos cargar esta sección
      </h1>
      <p className="muted mx-auto mt-4 max-w-md text-sm leading-6">
        Estamos experimentando una breve interrupción en la conexión. Puedes intentar recargar la página o volver a la tienda.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={reset} className="button-primary">
          <RotateCcw size={16} /> Reintentar
        </button>
        <Link href="/tienda" className="button-secondary">
          Explorar tienda
        </Link>
      </div>
    </main>
  );
}
