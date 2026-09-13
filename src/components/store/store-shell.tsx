import { getSettings } from "@/lib/data";
import { Footer } from "./footer";
import { Header } from "./header";

export async function StoreShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const banner = settings?.show_promo_banner ? settings.promo_banner : null;
  return <div className="min-h-screen"><Header banner={banner} />{children}<Footer settings={settings} /></div>;
}
