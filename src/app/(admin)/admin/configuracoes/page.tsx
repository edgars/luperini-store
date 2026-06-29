import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlaceholderPage } from "@/components/admin/placeholder-page";

export default function AdminSettingsPage() {
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Configurações"
        description="Preferências gerais da loja e integrações."
      />
      <AdminPlaceholderPage />
    </div>
  );
}
