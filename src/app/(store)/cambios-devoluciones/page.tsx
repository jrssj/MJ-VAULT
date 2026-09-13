import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Page() { const settings = await getSettings(); return <ContentPage eyebrow="Políticas" title="Cambios y devoluciones"><p>{settings?.returns_policy || "Las condiciones de cambios y devoluciones están pendientes de publicación por parte de MJ Vault. Antes de comprar, solicita la política vigente por WhatsApp."}</p></ContentPage>; }
