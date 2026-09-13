"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import type { Category } from "@/types";

export function Header({
  banner,
  categories = [],
}: {
  banner?: string | null;
  categories?: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setOpen } = useCart();

  const mainCategories = categories.filter((c) => c.active && !c.parent_id);
  const leftCategoryLinks = mainCategories.slice(0, 2).map((c) => [c.name, `/categoria/${c.slug}`] as const);
  const rightCategoryLinks = mainCategories.slice(2, 4).map((c) => [c.name, `/categoria/${c.slug}`] as const);

  const leftLinks = [
    ["Inicio", "/"],
    ["Tienda", "/tienda"],
    ...leftCategoryLinks,
  ] as const;

  const rightLinks = [
    ...rightCategoryLinks,
    ["Nuevos", "/tienda?new=true"],
    ["Nosotros", "/nosotros"],
  ] as const;

  return (
    <>
      {banner && (
        <div className="bg-[#12110f] px-4 py-2 text-center text-xs tracking-[.11em] text-white">
          {banner}
        </div>
      )}
      <header className="sticky top-0 z-50 border-b hairline bg-[color:rgba(247,244,238,.94)] backdrop-blur-md">
        <div className="container-page grid h-18 grid-cols-[1fr_auto_1fr] items-center">
          <button
            className="justify-self-start p-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={21} />
          </button>
          <nav className="hidden items-center gap-6 lg:flex">
            {leftLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-semibold uppercase tracking-[.12em] hover:text-[var(--gold)]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="display text-3xl font-semibold tracking-[-.05em]"
            aria-label="MJ Vault, inicio"
          >
            MJ <span className="text-[var(--gold)]">Vault</span>
          </Link>
          <div className="flex items-center justify-self-end gap-1">
            <nav className="mr-4 hidden items-center gap-6 lg:flex">
              {rightLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-semibold uppercase tracking-[.12em] hover:text-[var(--gold)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <button
              className="p-2"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <button
              className="relative p-2"
              onClick={() => setOpen(true)}
              aria-label={`Carrito, ${count} productos`}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[var(--gold)] text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="modal-open fixed inset-0 z-[60] flex flex-col justify-between overflow-y-auto bg-[var(--ivory)] p-6 lg:hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="display text-3xl">MJ Vault</span>
              <button
                className="p-2"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <X />
              </button>
            </div>
            <nav className="mt-10 grid">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="display border-b hairline py-3 text-3xl"
              >
                Inicio
              </Link>
              <Link
                href="/tienda"
                onClick={() => setMenuOpen(false)}
                className="display border-b hairline py-3 text-3xl"
              >
                Tienda
              </Link>
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="display border-b hairline py-3 text-3xl text-[var(--gold)]"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/tienda?new=true"
                onClick={() => setMenuOpen(false)}
                className="display border-b hairline py-3 text-3xl"
              >
                Nuevos
              </Link>
              <Link
                href="/nosotros"
                onClick={() => setMenuOpen(false)}
                className="display border-b hairline py-3 text-3xl"
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                onClick={() => setMenuOpen(false)}
                className="display border-b hairline py-3 text-3xl"
              >
                Contacto
              </Link>
            </nav>
          </div>
          <p className="muted mt-8 text-sm">Tienda 100% virtual</p>
        </div>
      )}

      {searchOpen && (
        <div className="modal-open fixed inset-0 z-[65] bg-[color:rgba(18,17,15,.96)] p-6 text-white">
          <div className="mx-auto max-w-3xl pt-[18vh]">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-[var(--gold-soft)]">
                Buscar en MJ Vault
              </p>
              <button
                className="p-2"
                onClick={() => setSearchOpen(false)}
                aria-label="Cerrar búsqueda"
              >
                <X />
              </button>
            </div>
            <form
              action="/buscar"
              className="mt-8 flex border-b border-white/40"
            >
              <input
                autoFocus
                name="q"
                className="min-w-0 flex-1 bg-transparent py-4 text-2xl outline-none placeholder:text-white/45 md:text-4xl"
                placeholder="¿Qué estás buscando?"
                aria-label="Buscar productos"
              />
              <button className="p-3" aria-label="Buscar">
                <Search />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

