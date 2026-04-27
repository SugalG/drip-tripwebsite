import { Branch } from "./branch";

export type UserRole = "SUPERADMIN" | "BRANCH_ADMIN";

export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
  branchId: string | null;
  branch?: Pick<Branch, "id" | "name" | "slug" | "hostname"> | null;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user: CurrentUser;
}
