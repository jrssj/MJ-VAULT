"use client";

import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { saveShippingZoneAction } from "@/app/admin/actions";
import type { ShippingZone } from "@/types";

export function ShippingZoneEditor({ zone }: { zone?: ShippingZone }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {zone ? (
        <button
          type="button"
          className="p-2"
          onClick={() => setOpen(true)}
          aria-label={`Editar ${zone.name}`}
        >
          <Pencil size={17} />
        </button>
      ) : (
        <button
          type="button"
          className="button-primary flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} /> Agregar zona de envío
        </button>
      )}

      {open && (
        <div className="modal-open fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4">
          <form
            action={async (formData) => {
              await saveShippingZoneAction(formData);
              setOpen(false);
            }}
            className="my-8 w-full max-w-lg bg-[var(--paper)] p-6 shadow-2xl"
          >
            {zone?.id && <input type="hidden" name="id" value={zone.id} />}
            <div className="flex items-center justify-between">
              <h2 className="display text-3xl">
                {zone ? "Editar zona de envío" : "Nueva zona de envío"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="p-2"
              >
                <X />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="field">
                <label htmlFor="zone-name">Nombre de la zona</label>
                <input
                  id="zone-name"
                  name="name"
                  required
                  className="input"
                  placeholder="Ej. Estados Unidos (Continental), México Nacional o Colombia"
                  defaultValue={zone?.name ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="zone-price">Tarifa en MXN ($)</label>
                <input
                  id="zone-price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="input"
                  placeholder="150"
                  defaultValue={zone?.price ?? 150}
                />
              </div>

              <div className="field">
                <label htmlFor="zone-free">
                  Envío gratis a partir de (opcional, en MXN $)
                </label>
                <input
                  id="zone-free"
                  name="free_shipping_threshold"
                  type="number"
                  min="0"
                  step="1"
                  className="input"
                  placeholder="Dejar vacío si no aplica"
                  defaultValue={zone?.free_shipping_threshold ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="zone-order">Orden de visualización</label>
                <input
                  id="zone-order"
                  name="sort_order"
                  type="number"
                  min="0"
                  className="input"
                  defaultValue={zone?.sort_order ?? 0}
                />
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={zone ? zone.active : true}
                />
                Zona activa (disponible para clientes en checkout)
              </label>

              <button className="button-primary mt-3">
                {zone ? "Guardar cambios" : "Crear zona"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
