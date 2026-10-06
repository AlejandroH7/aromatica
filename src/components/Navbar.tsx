"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { selectCount, useCartStore } from "@/store/cart";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const count = useCartStore(selectCount);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
  }

  const session = mounted ? user : null;

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-sand-dark bg-sand-light/90 shadow-soft" : "border-transparent bg-sand-light/70"
      }`}
    >
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-light tracking-wide text-ink sm:text-[1.7rem]">
          Aromática
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          {session ? (
            <>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="link-quiet">
                  Admin
                </Link>
              )}
              <span className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-ink sm:inline">
                {session.name}
              </span>
              <button onClick={handleLogout} className="link-quiet">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="link-quiet">
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-sm border border-gold/70 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-gold-dark transition-colors duration-200 hover:bg-gold hover:text-ink sm:px-4 sm:text-[0.68rem]"
              >
                Registrarse
              </Link>
            </>
          )}
          <Link href="/cart" className="link-quiet inline-flex items-center gap-2" aria-label="Carrito">
            Carrito
            {mounted && count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.62rem] tracking-normal text-ink">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
