import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPlaceholderPage } from "@/components/admin/placeholder-page";

export default function AdminFinancePage() {
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Financeiro"
        description="Receita, margem e indicadores do negócio."
      />
      <AdminPlaceholderPage />
    </div>
  );
}
