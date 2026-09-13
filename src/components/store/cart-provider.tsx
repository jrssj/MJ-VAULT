"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types";

type CartContextValue = { items: CartItem[]; count: number; subtotal: number; open: boolean; setOpen: (open: boolean) => void; addItem: (item: Omit<CartItem, "key">) => void; updateQuantity: (key: string, quantity: number) => void; removeItem: (key: string) => void; clear: () => void; };
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mj-vault-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => { try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setItems(JSON.parse(saved) as CartItem[]); } catch { window.localStorage.removeItem(STORAGE_KEY); } setReady(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, ready]);
  const addItem = useCallback((incoming: Omit<CartItem, "key">) => { const key = `${incoming.productId}:${incoming.variantId ?? "base"}`; setItems((current) => { const found = current.find((item) => item.key === key); if (found) return current.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + incoming.quantity, item.maxStock) } : item); return [...current, { ...incoming, key, quantity: Math.min(incoming.quantity, incoming.maxStock) }]; }); setOpen(true); setNotice(`${incoming.name} se agregó al carrito.`); window.setTimeout(() => setNotice(""), 2600); }, []);
  const updateQuantity = useCallback((key: string, quantity: number) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) } : item)), []);
  const removeItem = useCallback((key: string) => setItems((current) => current.filter((item) => item.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, count, subtotal, open, setOpen, addItem, updateQuantity, removeItem, clear }), [items, count, subtotal, open, addItem, updateQuantity, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}{notice && <div role="status" className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 bg-[#12110f] px-5 py-3 text-sm text-white shadow-xl">{notice}</div>}{open && <CartDrawer />}</CartContext.Provider>;
}

export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart debe usarse dentro de CartProvider"); return value; }

function CartDrawer() {
  const { items, subtotal, setOpen, updateQuantity, removeItem } = useCart();
  return <div className="modal-open fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Carrito de compras"><button className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} aria-label="Cerrar carrito" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--paper)] shadow-2xl"><div className="flex items-center justify-between border-b hairline px-5 py-5"><h2 className="display text-3xl">Tu carrito</h2><button onClick={() => setOpen(false)} className="p-2" aria-label="Cerrar"><X /></button></div><div className="flex-1 overflow-y-auto p-5">{!items.length ? <div className="grid h-full place-content-center text-center"><ShoppingBag className="mx-auto mb-4 text-[var(--gold)]" size={34} strokeWidth={1.2} /><p className="display text-2xl">Tu selección está vacía</p><p className="muted mt-2 text-sm">Descubre piezas elegidas para ti.</p><Link href="/tienda" onClick={() => setOpen(false)} className="button-primary mt-6">Ver colección</Link></div> : <div className="space-y-6">{items.map((item) => <div key={item.key} className="grid grid-cols-[88px_1fr] gap-4 border-b hairline pb-6"><div className="relative aspect-[3/4] overflow-hidden bg-white">{item.image && <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover object-top" />}</div><div><div className="flex justify-between gap-3"><p className="text-sm font-semibold leading-snug">{item.name}</p><button onClick={() => removeItem(item.key)} aria-label={`Eliminar ${item.name}`}><X size={16} /></button></div>{(item.size || item.color) && <p className="muted mt-1 text-xs">{[item.color, item.size].filter(Boolean).join(" · ")}</p>}<p className="mt-2 text-sm">{formatCurrency(item.price)}</p><div className="mt-3 inline-flex items-center border hairline"><button className="p-2" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Reducir cantidad"><Minus size={14} /></button><span className="min-w-8 text-center text-sm">{item.quantity}</span><button className="p-2" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Aumentar cantidad" disabled={item.quantity >= item.maxStock}><Plus size={14} /></button></div></div></div>)}</div>}</div>{!!items.length && <div className="border-t hairline p-5"><div className="mb-4 flex justify-between text-sm"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div className="grid grid-cols-2 gap-3"><Link href="/carrito" onClick={() => setOpen(false)} className="button-secondary">Ver carrito</Link><Link href="/checkout" onClick={() => setOpen(false)} className="button-primary">Finalizar</Link></div></div>}</aside></div>;
}
