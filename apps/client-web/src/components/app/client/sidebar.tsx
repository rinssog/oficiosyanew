"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, HomeIcon, Settings, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/css";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
  icon?: typeof HomeIcon;
};

const emergency = {
  href: "/app/client/urgencias",
  label: "Urgencias 24/7",
};
const NAV_ITEMS: NavItem[] = [
  { href: "/app/client", label: "Panel general", icon: HomeIcon },
  {
    href: "/app/client/contratos",
    label: "Contratos y seguros",
    icon: FileText,
  },
  {
    href: "/app/client/facturacion",
    label: "Pagos y facturas",
    icon: CreditCard,
  },
  { href: "/app/client/preferences", label: "Preferencias", icon: Settings },
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
          <Link
            key={emergency.href}
            href={emergency.href}
            className={cn(
              "mx-3 flex items-center justify-between rounded-lg border px-3 py-2 text-sm no-underline transition-colors",
              pathname === emergency.href ||
                pathname?.startsWith(emergency.href)
                ? "border-red-200 bg-red-100 font-semibold text-red-800"
                : "border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
            )}
          >
            <span>{emergency.label}</span>
          </Link>

          <div className="px-3 pt-3">
            <Separator className="my-1" />
          </div>

          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app" && pathname?.startsWith(item.href));
            const Icon = item.icon;
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
                <span className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {item.label}
                </span>
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
