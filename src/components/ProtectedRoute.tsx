import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
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