import type { Metadata } from "next";
import { CartPageContent } from "@/components/store/cart-page";
export const metadata: Metadata = { title: "Carrito" };
export default function CartPage() { return <main className="container-page py-10 md:py-16"><p className="eyebrow text-[var(--gold)]">Tu selección</p><h1 className="display mb-10 mt-2 text-5xl md:text-6xl">Carrito</h1><CartPageContent/></main>; }
