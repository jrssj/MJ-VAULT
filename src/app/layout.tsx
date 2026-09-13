import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartProvider } from "@/components/store/cart-provider";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "MJ Vault | Boutique virtual", template: "%s | MJ Vault" },
  description:
    "Boutique virtual de moda, belleza y accesorios seleccionados. Compra online con atención personalizada por WhatsApp.",
  applicationName: "MJ Vault",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: "es_US",
    url: "/",
    siteName: "MJ Vault",
    title: "MJ Vault | Boutique virtual",
    description:
      "Boutique virtual de moda, belleza y accesorios seleccionados con intención.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MJ Vault | Boutique virtual",
    description:
      "Boutique virtual de moda, belleza y accesorios seleccionados con intención.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "MJ Vault",
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        name: "MJ Vault",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/buscar?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

