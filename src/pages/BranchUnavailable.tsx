import { AlertTriangle } from "lucide-react";

type Props = {
  message?: string;
};

export default function BranchUnavailable({ message }: Props) {
  const hostname = window.location.hostname;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">Storefront not configured</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            No active branch is currently connected to this address.
          </p>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Requested Hostname
            </div>
            <div className="mt-1 break-all font-medium">{hostname}</div>
          </div>

          {message && (
            <p className="mt-4 text-xs text-slate-400">
              Technical detail: {message}
            </p>
          )}

          <p className="mt-6 text-sm text-slate-300">
            If this branch should be live, ask the platform superadmin to create or activate this
            exact hostname in the branch dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
