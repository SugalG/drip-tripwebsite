import { ArrowLeft, Crown, LogOut, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { CurrentUser } from "@/types/user";
import { Branch } from "@/types/branch";

type Props = {
  onLogout: () => void;
  user?: CurrentUser;
  branch?: Branch | null;
};

export default function AdminTopBar({ onLogout, user, branch }: Props) {
  const isSuperadmin = user?.role === "SUPERADMIN";

  return (
    <div className="w-full max-w-6xl rounded-[1.25rem] border border-border/60 bg-white/70 backdrop-blur-xl shadow-card px-4 py-4 mb-6 sm:rounded-[2rem] sm:px-6 sm:py-5 sm:mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>

          <div>
            <h1 className="text-2xl font-display font-bold gradient-text sm:text-3xl">
              {isSuperadmin ? "Platform Control" : `${branch?.name || "Branch"} Dashboard`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSuperadmin
                ? "Create branches, assign hostnames, and manage branch-admin access."
                : "Manage your storefront details, products, and access from one place."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-3 sm:rounded-2xl sm:px-4">
            {isSuperadmin ? (
              <Crown className="w-4 h-4 text-amber-500" />
            ) : (
              <Store className="w-4 h-4 text-primary" />
            )}
            <div className="min-w-0 text-sm">
              <div className="font-semibold">{user?.username || "Admin"}</div>
              <div className="truncate text-muted-foreground">
                {isSuperadmin ? "Superadmin" : branch?.hostname || "Branch admin"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-sm sm:rounded-2xl"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
