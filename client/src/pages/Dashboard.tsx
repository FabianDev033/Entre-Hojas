import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;

  if (!currentUser) return <Navigate to="/admin/login" replace />;

  return <main className="w-svw h-svh">Dashboard</main>;
}
