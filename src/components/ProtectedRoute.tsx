import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api
      .getCurrentUser()
      .then((data) => {
        setOk(Boolean(data?.authenticated));
        setLoading(false);
      })
      .catch(() => {
        setOk(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Checking session...</div>;
  }

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
