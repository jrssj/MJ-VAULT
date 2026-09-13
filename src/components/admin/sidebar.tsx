"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FolderTree, LayoutDashboard, LogOut, Menu, Settings, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";

const links = [["Dashboard","/admin",LayoutDashboard],["Productos","/admin/productos",Boxes],["Categorías","/admin/categorias",FolderTree],["Pedidos","/admin/pedidos",ShoppingBag],["Configuración","/admin/configuracion",Settings]] as const;
export function AdminSidebar() { const pathname = usePathname(); const [open,setOpen] = useState(false); const content = <><div className="flex h-20 items-center justify-between border-b border-white/15 px-6"><Link href="/admin" className="display text-3xl">MJ <span className="text-[var(--gold-soft)]">Vault</span></Link><button className="p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X/></button></div><nav className="flex-1 p-4">{links.map(([label,href,Icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`mb-1 flex min-h-12 items-center gap-3 px-4 text-sm ${active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Icon size={18}/>{label}</Link>; })}</nav><form action={logoutAction} className="border-t border-white/15 p-4"><button className="flex min-h-12 w-full items-center gap-3 px-4 text-sm text-white/70 hover:text-white"><LogOut size={18}/>Cerrar sesión</button></form></>;
  return <><button className="fixed left-3 top-3 z-40 rounded-full bg-[#12110f] p-3 text-white shadow-lg lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú administrativo"><Menu size={20}/></button><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#12110f] text-white lg:flex">{content}</aside>{open && <aside className="modal-open fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col bg-[#12110f] text-white shadow-2xl lg:hidden">{content}</aside>}</>;
}
