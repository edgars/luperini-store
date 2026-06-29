import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  DashboardChartsRow,
  DashboardInsightsRow,
} from "@/components/admin/dashboard/charts-row";
import {
  DashboardPageActions,
  DashboardStatsCards,
} from "@/components/admin/dashboard/stats-cards";
import { DashboardTables } from "@/components/admin/dashboard/tables-row";
import { getDashboardStats } from "@/lib/admin/get-dashboard-stats";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const stats = await getDashboardStats();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Dashboard da loja"
        description="Visão geral de vendas, pedidos e desempenho do catálogo."
        actions={<DashboardPageActions />}
      />

      <DashboardStatsCards
        revenueTotal={stats.revenueTotal}
        orderCount={stats.orderCount}
        userCount={stats.userCount}
      />

      <DashboardChartsRow />
      <DashboardInsightsRow />
      <DashboardTables
        recentOrders={stats.recentOrders}
        topProducts={stats.topProducts}
      />
    </div>
  );
}
