import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { CreditCard, HomeIcon, Settings, FileText } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
};

const items: NavItem[] = [
  { href: "/app/provider", label: "Inicio", icon: HomeIcon },
  {
    href: "/app/provider/contracts",
    label: "Contratos y seguros",
    icon: FileText,
  },
  {
    href: "/app/provider/billing",
    label: "Pagos y facturas",
    icon: CreditCard,
  },
  { href: "/app/preferences", label: "Configuracion", icon: Settings },
];

export function ProviderSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton className="px-4">
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
