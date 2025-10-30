"use client";

import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  //   const { user, provider, logout, isReady } = useAuth() as any;

  const handleLogout = () => {
    // logout?.();
    if (typeof window !== "undefined") window.location.href = "/";
  };

  const primaryLinks = [
    { href: "/planes", label: "Planes" },
    { href: "/contacto", label: "Contacto" },
    { href: "/soporte", label: "Centro de ayuda" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <img
            className="h-10 w-10 transition-transform group-hover:scale-105"
            src="/assets/oficiosya-logo.svg"
            alt="OficiosYa"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold text-emerald-800">OficiosYa</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}

          {false ? ( // isReady && user
            <div className="flex items-center gap-3">
              {/* <span className="text-sm font-semibold text-emerald-800">
                {user.name || user.email}
                {provider ? " · Prestador" : ""}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                Cerrar sesión
              </button> */}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/auth/login?role=client"
                className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Ingresar clientes
              </Link>
              <Link
                href="/auth/login?role=provider"
                className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Ingresar prestadores
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
