type RequestBranch = {
  id: string;
  name: string;
  slug: string;
  hostname: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
  mapEmbedUrl?: string | null;
  storeHours?: string | null;
  settings?: unknown;
};

type RequestUser = {
  userId: string;
  username: string;
  role: "SUPERADMIN" | "BRANCH_ADMIN";
  branchId: string | null;
};

declare global {
  namespace Express {
    interface Request {
      branch?: RequestBranch;
      user?: RequestUser;
    }
  }
}

export {};
