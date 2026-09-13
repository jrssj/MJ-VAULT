import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false, follow: false } };
export default function CheckoutPage() { return <main className="container-page py-10 md:py-16"><p className="eyebrow text-[var(--gold)]">Compra asistida</p><h1 className="display mb-10 mt-2 text-5xl md:text-6xl">Finalizar pedido</h1><CheckoutForm/></main>; }
