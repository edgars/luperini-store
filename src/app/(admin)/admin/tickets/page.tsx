import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlaceholderPage } from "@/components/admin/placeholder-page";

export default function AdminTicketsPage() {
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Tickets"
        description="Canal de suporte vinculado aos pedidos."
      />
      <AdminPlaceholderPage />
    </div>
  );
}
