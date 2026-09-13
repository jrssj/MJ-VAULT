import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Page() { const settings = await getSettings(); return <ContentPage eyebrow="Información" title="Envíos"><p>{settings?.shipping_copy || "La cobertura, el tiempo estimado y el valor del envío se confirman de forma personalizada por WhatsApp antes de completar la compra."}</p><p>No se ha publicado una dirección física porque MJ Vault opera exclusivamente en línea.</p></ContentPage>; }
