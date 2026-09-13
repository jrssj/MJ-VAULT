import { ContentPage } from "@/components/store/content-page";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Page() { const settings = await getSettings(); return <ContentPage eyebrow="Políticas" title="Privacidad"><p>{settings?.privacy_policy || "La política de privacidad está pendiente de revisión y publicación por parte de MJ Vault. Los datos del checkout se utilizan para gestionar el pedido y la entrega."}</p></ContentPage>; }
