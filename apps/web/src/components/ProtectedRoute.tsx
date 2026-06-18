import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
