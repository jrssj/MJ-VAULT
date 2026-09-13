import { getCategories, getSettings } from "@/lib/data";
import { Footer } from "./footer";
import { Header } from "./header";

export async function StoreShell({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const banner = settings?.show_promo_banner ? settings.promo_banner : null;
  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <Header banner={banner} categories={categories} />
      {children}
      <Footer settings={settings} />
    </div>
  );
}

