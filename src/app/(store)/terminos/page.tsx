import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Page() { const settings = await getSettings(); return <ContentPage eyebrow="Políticas" title="Términos y condiciones"><p>{settings?.terms_copy || "Los términos y condiciones comerciales están pendientes de revisión y publicación por parte de MJ Vault. La creación de un pedido no equivale a pago ni confirmación; ambos se coordinan por WhatsApp."}</p></ContentPage>; }
