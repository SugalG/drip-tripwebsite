import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Branch } from "@/types/branch";

type BranchContextValue = {
  branch: Branch | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

const BranchContext = createContext<BranchContextValue>({
  branch: null,
  isLoading: true,
  isError: false,
  errorMessage: "",
});

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const branchQuery = useQuery({
    queryKey: ["current-branch"],
    queryFn: api.getCurrentBranch,
    retry: false,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  return (
    <BranchContext.Provider
      value={{
        branch: branchQuery.data ?? null,
        isLoading: branchQuery.isLoading,
        isError: branchQuery.isError,
        errorMessage: branchQuery.error instanceof Error ? branchQuery.error.message : "",
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}
