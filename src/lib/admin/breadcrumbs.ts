import { ADMIN_NAV_ITEMS } from "@/lib/admin/navigation";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const SEGMENT_LABELS: Record<string, string> = {
  novo: "Novo",
  home: "Home da loja",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSegmentLabel(segment: string, previousSegment?: string): string {
  if (UUID_PATTERN.test(segment)) {
    if (previousSegment === "produtos") return "Editar produto";
    if (previousSegment === "fornecedores") return "Editar fornecedor";
    if (previousSegment === "contatos") return "Editar contato";
    return "Detalhe";
  }

  const navItem = ADMIN_NAV_ITEMS.find((item) => item.href === `/admin/${segment}`);
  if (navItem) return navItem.label;

  if (segment === "admin") return "Dashboard";

  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function getAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/admin") return [];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    currentPath += `/${segment}`;

    if (segment === "admin") continue;

    const isLast = index === segments.length - 1;
    const previousSegment = index > 0 ? segments[index - 1] : undefined;

    crumbs.push({
      label: getSegmentLabel(segment, previousSegment),
      href: isLast ? undefined : currentPath,
    });
  }

  return crumbs;
}

export function getAdminBackHref(pathname: string): string | undefined {
  if (pathname === "/admin") return undefined;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 2) return "/admin";

  const parentPath = `/${segments.slice(0, -1).join("/")}`;
  return parentPath === "/admin" ? "/admin" : parentPath;
}

export function shouldShowAdminPageNavigation(pathname: string) {
  return pathname !== "/admin";
}
