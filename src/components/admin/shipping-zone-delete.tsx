"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { deleteShippingZoneAction } from "@/app/admin/actions";

export function ShippingZoneDelete({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="p-2 text-[var(--danger)]"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar ${name}`}
      >
        <Trash2 size={17} />
      </button>

      {open && (
        <div className="modal-open fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md bg-[var(--paper)] p-6">
            <div className="flex justify-between">
              <h2 className="display text-3xl">Eliminar zona de envío</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>
            <p className="muted mt-4 text-sm leading-6">
              ¿Deseas eliminar la zona de envío &ldquo;{name}&rdquo;? Los pedidos pasados conservarán su registro histórico.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="button-secondary"
                onClick={() => setOpen(false)}
              >
                Conservar
              </button>
              <form action={deleteShippingZoneAction.bind(null, id)}>
                <button className="button-primary w-full border-[var(--danger)] bg-[var(--danger)] text-white">
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
