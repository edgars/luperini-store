import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlaceholderPage } from "@/components/admin/placeholder-page";

export default function AdminOrdersPage() {
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Pedidos"
        description="Acompanhe e gerencie os pedidos da loja."
      />
      <AdminPlaceholderPage />
    </div>
  );
}
