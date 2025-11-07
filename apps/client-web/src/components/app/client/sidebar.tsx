"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/css";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/app/client", label: "Panel general" },
  { href: "/app/client/urgencias", label: "Urgencias 24/7", badge: "nuevo" },
  { href: "/app/client/contratos", label: "Contratos y seguros" },
  { href: "/app/client/facturacion", label: "Pagos y facturas" },
  { href: "/app/client/preferences", label: "Preferencias" },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background sticky top-24 h-max rounded-2xl border shadow-sm">
      <div className="p-6">
        <div className="mb-3 flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Panel
          </span>
          <strong className="text-foreground text-xl">Cliente</strong>
          <span className="text-muted-foreground text-sm">
            Gestiona servicios, contratos, seguros y evidencias desde un único
            panel.
          </span>
        </div>
        <Separator />
      </div>
      <ScrollArea className="max-h-[calc(100vh-12rem)] px-3 pb-4">
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm no-underline transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "bg-primary/5 text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <Badge className="rounded-full">{item.badge}</Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

export default ClientSidebar;
