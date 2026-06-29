import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlaceholderPage } from "@/components/admin/placeholder-page";

export default function AdminShipmentsPage() {
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Envios"
        description="Acompanhe etiquetas, transportadoras e rastreios."
      />
      <AdminPlaceholderPage />
    </div>
  );
}
