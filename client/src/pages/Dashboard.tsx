import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { StatCard } from "../Components/adminLayout";

export default function Dashboard() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;

  if (!currentUser) return <Navigate to="/admin/login" replace />;
  const today: Date = new Date();
  const formattedDate = today
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^./, (char) => char.toUpperCase());
  return (
    <main className="w-full h-svh bg-bg-dark flex flex-col items-center">
      <section className="flex flex-col gap-3 font-Outfit w-11/12 py-2">
        <span className="font-medium text-3xl text-black">
          Hola {currentUser.user}
        </span>
        <span className="font-light text-md text-black/80">
          {formattedDate}
        </span>
      </section>
      <section className="w-11/12 h-10/12 mt-5 grid grid-cols-3 grid-rows-4 gap-7">
        <StatCard metric="sells" />
        <StatCard metric="orders" />
        <StatCard metric="AOV" />
        <StatCard metric="sumOrders" />
        <StatCard metric="stock" />
        <StatCard metric="revenue" />
        <StatCard metric="performance" />
      </section>
    </main>
  );
}
