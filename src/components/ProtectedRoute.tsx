import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me`, {
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
    // keep where user came from, useful for redirect after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}