import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useBranch } from "@/contexts/BranchContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { branch } = useBranch();

  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/admin";

  useEffect(() => {
    api
      .getCurrentUser()
      .then((d) => {
        if (d?.authenticated) navigate("/admin", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      navigate(from, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          {branch ? `${branch.name} branch dashboard` : "Branch dashboard"}
        </p>

        <label className="block mb-2 font-semibold">Username</label>
        <input
          type="text"
          className="w-full border p-2 mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Logging in..." : "Login"}
        </button>

        {mutation.isError && (
          <p className="mt-4 text-center text-red-500">
            {(mutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
