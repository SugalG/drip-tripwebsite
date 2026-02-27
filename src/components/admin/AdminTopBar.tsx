import { ArrowLeft, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  onLogout: () => void;
};

export default function AdminTopBar({ onLogout }: Props) {
  return (
    <div className="w-full max-w-lg flex items-center justify-between mb-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </Link>

      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}