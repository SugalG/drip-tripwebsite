const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MAIN_BRANCH_ID = "00000000-0000-0000-0000-000000000001";
const PASSWORD_SEPARATOR = ".";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}${PASSWORD_SEPARATOR}${hash}`;
}

function getSeedConfig() {
  const baseDomain = process.env.SEED_BASE_DOMAIN || "dripandtrip.local";
  const mainHostname = process.env.SEED_MAIN_HOSTNAME || baseDomain;

  return {
    mainBranch: {
      id: MAIN_BRANCH_ID,
      name: process.env.SEED_MAIN_BRANCH_NAME || "Main Branch",
      slug: process.env.SEED_MAIN_BRANCH_SLUG || "main",
      subdomain: null,
      domain: baseDomain,
      hostname: mainHostname,
      address: process.env.SEED_MAIN_BRANCH_ADDRESS || "Kupondole, Lalitpur, Nepal",
      phone: process.env.SEED_MAIN_BRANCH_PHONE || "+977 9828037561",
      email: process.env.SEED_MAIN_BRANCH_EMAIL || "main@dripandtrip.com.np",
      whatsappNumber: process.env.SEED_MAIN_BRANCH_WHATSAPP || "9779828037561",
      mapEmbedUrl:
        process.env.SEED_MAIN_BRANCH_MAP ||
        "https://maps.google.com/maps?q=27.6882916,85.3162569&z=18&output=embed",
      storeHours:
        process.env.SEED_MAIN_BRANCH_HOURS ||
        "Sunday - Friday: 11:00 AM - 7:00 PM\nSaturday: 12:00 PM - 6:00 PM",
    },
    mainAdmin: {
      id: "00000000-0000-0000-0000-000000000102",
      username: process.env.SEED_MAIN_ADMIN_USERNAME || "mainadmin",
      email: process.env.SEED_MAIN_ADMIN_EMAIL || "main.admin@dripandtrip.com.np",
      password: process.env.SEED_MAIN_ADMIN_PASSWORD || "admin12345",
      name: process.env.SEED_MAIN_ADMIN_NAME || "Main Branch Admin",
    },
    superadmin: {
      id: "00000000-0000-0000-0000-000000000101",
      username: process.env.SEED_SUPERADMIN_USERNAME || "superadmin",
      email: process.env.SEED_SUPERADMIN_EMAIL || "superadmin@dripandtrip.com.np",
      password: process.env.SEED_SUPERADMIN_PASSWORD || "admin12345",
      name: process.env.SEED_SUPERADMIN_NAME || "Platform Superadmin",
    },
  };
}

async function upsertBranch(branch) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "Branch" (
        "id", "name", "slug", "subdomain", "domain", "hostname", "isActive",
        "address", "phone", "email", "whatsappNumber", "mapEmbedUrl", "storeHours",
        "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, true,
        $7, $8, $9, $10, $11, $12,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT ("id")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "slug" = EXCLUDED."slug",
        "subdomain" = EXCLUDED."subdomain",
        "domain" = EXCLUDED."domain",
        "isActive" = true,
        "address" = EXCLUDED."address",
        "phone" = EXCLUDED."phone",
        "email" = EXCLUDED."email",
        "whatsappNumber" = EXCLUDED."whatsappNumber",
        "mapEmbedUrl" = EXCLUDED."mapEmbedUrl",
        "storeHours" = EXCLUDED."storeHours",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    branch.id,
    branch.name,
    branch.slug,
    branch.subdomain,
    branch.domain,
    branch.hostname,
    branch.address,
    branch.phone,
    branch.email,
    branch.whatsappNumber,
    branch.mapEmbedUrl,
    branch.storeHours
  );
}

async function upsertUser(user, role, branchId) {
  const passwordHash = hashPassword(user.password);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "User" (
        "id", "name", "username", "email", "passwordHash", "role", "isActive",
        "branchId", "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6::"UserRole", true,
        $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT ("username")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "email" = EXCLUDED."email",
        "passwordHash" = EXCLUDED."passwordHash",
        "role" = EXCLUDED."role",
        "isActive" = true,
        "branchId" = EXCLUDED."branchId",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    user.id,
    user.name,
    user.username,
    user.email,
    passwordHash,
    role,
    branchId
  );
}

async function backfillProducts(mainBranchId) {
  await prisma.$executeRawUnsafe(
    `
      UPDATE "Product"
      SET "branchId" = $1
      WHERE "branchId" IS NULL
    `,
    mainBranchId
  );
}

async function main() {
  const config = getSeedConfig();

  await upsertBranch(config.mainBranch);
  await backfillProducts(config.mainBranch.id);

  await upsertUser(config.superadmin, "SUPERADMIN", null);
  await upsertUser(config.mainAdmin, "BRANCH_ADMIN", config.mainBranch.id);

  console.log("Seed completed.");
  console.log(`Main branch: ${config.mainBranch.hostname}`);
  console.log(`Superadmin login: ${config.superadmin.username} / ${config.superadmin.password}`);
  console.log(`Main admin login: ${config.mainAdmin.username} / ${config.mainAdmin.password}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
