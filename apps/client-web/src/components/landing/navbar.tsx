"use client";

import Link from "next/link";
import Logo from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { UserUtils } from "@/lib/user";
import type { Session } from "@/lib/auth";
import { useRouter } from "next/navigation";

function AuthenticatedActions({ user }: Pick<NonNullable<Session>, "user">) {
  const router = useRouter();
  function getUserInitials() {
    const { firstName, lastName } = UserUtils.getInitials(user.name);
    return firstName + lastName;
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/app"
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        Ir a la app
      </Link>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Abrir menú de usuario"
            className="rounded-full hover:cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <Avatar className="size-8 outline-2">
              {!!user.image ? (
                <AvatarImage src={user.image} alt={user.name || "Usuario"} />
              ) : (
                <AvatarFallback className="font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-56 p-1">
          <div className="flex flex-col">
            <Link
              href="/dashboard/profile"
              className="rounded-sm px-2 py-1.5 text-sm hover:bg-emerald-50 hover:text-emerald-700"
            >
              Perfil
            </Link>
            <Link
              href="/dashboard/preferences"
              className="rounded-sm px-2 py-1.5 text-sm hover:bg-emerald-50 hover:text-emerald-700"
            >
              Preferencias
            </Link>
            <div className="my-1 h-px bg-gray-200" />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-sm px-2 py-1.5 text-left text-sm text-red-700 hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function NotAuthenticatedAction() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/auth/sign-in"
        className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        Crear cuenta
      </Link>
    </div>
  );
}

export default function Navbar({ session }: { session: Session }) {
  const primaryLinks = [
    { href: "/planes", label: "Planes" },
    { href: "/contacto", label: "Contacto" },
    { href: "/soporte", label: "Centro de ayuda" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <Logo
            className="h-10 w-10 transition-transform group-hover:scale-105"
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

          {!session ? (
            <NotAuthenticatedAction />
          ) : (
            <AuthenticatedActions {...session} />
          )}
        </nav>
      </div>
    </header>
  );
}
