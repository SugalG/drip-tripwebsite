import requireAuth, { requireBranchAccess, requireRole } from "./requireAuth";

const requireAdmin = [requireAuth, requireRole("SUPERADMIN", "BRANCH_ADMIN"), requireBranchAccess];

export default requireAdmin;
