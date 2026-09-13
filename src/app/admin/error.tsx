"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-red-50 text-[var(--danger)]">
        <AlertTriangle size={24} />
      </div>
      <h2 className="display mt-4 text-3xl">Error en el panel de administración</h2>
      <p className="muted mt-2 max-w-md text-sm">
        Ocurrió un inconveniente al procesar la solicitud administrativa.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="button-primary">
          <RotateCcw size={16} /> Reintentar
        </button>
        <Link href="/admin" className="button-secondary">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
