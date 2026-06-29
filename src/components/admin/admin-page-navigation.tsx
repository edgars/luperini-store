"use client";

import { usePathname } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import {
  getAdminBreadcrumbs,
  shouldShowAdminPageNavigation,
} from "@/lib/admin/breadcrumbs";

export function AdminPageNavigation() {
  const pathname = usePathname();

  if (!shouldShowAdminPageNavigation(pathname)) {
    return null;
  }

  const breadcrumbs = getAdminBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <AdminBreadcrumbs items={breadcrumbs} />
    </div>
  );
}
