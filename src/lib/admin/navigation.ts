import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: Package },
      { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
      { href: "/admin/fornecedores", label: "Fornecedores", icon: Warehouse },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/envios", label: "Envios", icon: Truck },
    ],
  },
  {
    label: "Suporte",
    items: [{ href: "/admin/tickets", label: "Tickets", icon: Ticket }],
  },
  {
    label: "Financeiro",
    items: [{ href: "/admin/financeiro", label: "Financeiro", icon: Wallet }],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
