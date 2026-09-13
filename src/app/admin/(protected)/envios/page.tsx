import { getShippingZones } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { ShippingZoneEditor } from "@/components/admin/shipping-zone-editor";
import { ShippingZoneDelete } from "@/components/admin/shipping-zone-delete";

export default async function ShippingZonesPage() {
  const zones = await getShippingZones(true);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--gold)]">Logística</p>
          <h1 className="display mt-2 text-5xl">Zonas de envío</h1>
          <p className="muted mt-3 text-sm">
            Configura las tarifas y condiciones de envío para cada zona o ciudad.
          </p>
        </div>
        <ShippingZoneEditor />
      </div>

      <div className="mt-8 overflow-x-auto border hairline bg-[var(--paper)]">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#e9e5dc] text-xs uppercase tracking-[.1em]">
            <tr>
              <th className="p-4">Zona / Ciudad</th>
              <th className="p-4">Tarifa</th>
              <th className="p-4">Envío gratis desde</th>
              <th className="p-4">Orden</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-t hairline">
                <td className="p-4">
                  <strong>{zone.name}</strong>
                </td>
                <td className="p-4">{formatCurrency(zone.price)}</td>
                <td className="p-4">
                  {zone.free_shipping_threshold !== null ? (
                    formatCurrency(zone.free_shipping_threshold)
                  ) : (
                    <span className="muted text-xs">No aplica</span>
                  )}
                </td>
                <td className="p-4 muted">{zone.sort_order}</td>
                <td className="p-4">
                  <span
                    className={`pill ${
                      zone.active
                        ? "bg-[var(--success)]"
                        : "bg-[var(--muted)]"
                    }`}
                  >
                    {zone.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <ShippingZoneEditor zone={zone} />
                    <ShippingZoneDelete id={zone.id} name={zone.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!zones.length && (
          <p className="muted p-10 text-center">
            No hay zonas de envío configuradas. Agrega tu primera zona.
          </p>
        )}
      </div>
    </>
  );
}
