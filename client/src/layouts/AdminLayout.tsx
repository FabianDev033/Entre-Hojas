import { Navigate, Outlet } from "react-router-dom";
import { Menu } from "../Components/common";
import { DashboardStatsProvider } from "../contexts/DashboardStatsContext";
import { OrdersProvider } from "../contexts/OrdersContext";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-svh bg-bg-dark p-6 font-Manrope" role="status">
        Verificando sesión...
      </main>
    );
  }

  if (!currentUser) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen">
      <aside>
        <Menu />
      </aside>

      <main className="flex-1">
        <DashboardStatsProvider>
          <OrdersProvider>
            <Outlet />
          </OrdersProvider>
        </DashboardStatsProvider>
      </main>
    </div>
  );
}
