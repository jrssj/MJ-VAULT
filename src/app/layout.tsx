import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartProvider } from "@/components/store/cart-provider";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "MJ Vault | Boutique virtual", template: "%s | MJ Vault" },
  description: "Boutique virtual de moda, belleza y accesorios seleccionados. Compra online con atención personalizada por WhatsApp.",
  applicationName: "MJ Vault",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}><body><CartProvider>{children}</CartProvider></body></html>;
}
