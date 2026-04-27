import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, ExternalLink, Pencil, Power, Save, X } from "lucide-react";
import { api } from "@/lib/api";

type BranchSummary = {
  id: string;
  name: string;
  slug: string;
  hostname: string;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    products: number;
  };
  users?: Array<{
    id: string;
    username: string;
    email: string | null;
    name: string | null;
    lastLoginAt?: string | null;
  }>;
};

type CreatedBranch = {
  name: string;
  hostname: string;
  adminUsername: string;
  temporaryPassword: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeHostnameInput = (value: string) => value.trim().toLowerCase();

const getHostnameError = (value: string) => {
  const hostname = normalizeHostnameInput(value);

  if (!hostname) return "Hostname is required.";
  if (hostname.includes("://")) return "Use the hostname only, without http:// or https://.";
  if (hostname.includes("/") || hostname.includes(":")) {
    return "Do not include paths, slashes, or ports.";
  }
  if (/\s/.test(hostname)) return "Hostname cannot contain spaces.";
  if (hostname.split(".").filter(Boolean).length < 2) {
    return "Use a full hostname like dang.dripandtrip.local.";
  }

  return "";
};

const formatDate = (value?: string | null) => {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function SuperadminBranchSetup() {
  const qc = useQueryClient();
  const { data: branches = [], isLoading } = useQuery<BranchSummary[]>({
    queryKey: ["admin-branches"],
    queryFn: api.getAdminBranches,
  });

  const [branchName, setBranchName] = useState("");
  const [branchSlug, setBranchSlug] = useState("");
  const [hostname, setHostname] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [message, setMessage] = useState("");
  const [createdBranch, setCreatedBranch] = useState<CreatedBranch | null>(null);
  const [copiedValue, setCopiedValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [branchMessages, setBranchMessages] = useState<Record<string, string>>({});
  const [branchSaving, setBranchSaving] = useState<Record<string, boolean>>({});
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editBranch, setEditBranch] = useState({
    branchName: "",
    branchSlug: "",
    hostname: "",
  });

  const [inlineAdmin, setInlineAdmin] = useState<
    Record<
      string,
      {
        adminName: string;
        adminUsername: string;
        adminEmail: string;
        adminPassword: string;
        resetPassword: string;
      }
    >
  >({});

  const suggestedSlug = useMemo(() => slugify(branchName), [branchName]);
  const activeSlug = branchSlug || suggestedSlug;
  const hostnameError = getHostnameError(hostname);

  const makeBranchUrl = (branchHostname: string, path = "") => {
    const protocol = window.location.protocol || "http:";
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${protocol}//${branchHostname}${port}${path}`;
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(label);
      window.setTimeout(() => setCopiedValue(""), 1600);
    } catch {
      setCopiedValue("Copy failed");
    }
  };

  const getInlineState = (branchId: string) =>
    inlineAdmin[branchId] || {
      adminName: "",
      adminUsername: "",
      adminEmail: "",
      adminPassword: "",
      resetPassword: "",
    };

  const updateInlineState = (
    branchId: string,
    key: "adminName" | "adminUsername" | "adminEmail" | "adminPassword" | "resetPassword",
    value: string
  ) => {
    setInlineAdmin((prev) => ({
      ...prev,
      [branchId]: {
        ...getInlineState(branchId),
        [key]: value,
      },
    }));
  };

  const save = async () => {
    const finalSlug = branchSlug || suggestedSlug;
    const cleanHostname = normalizeHostnameInput(hostname);
    const hostError = getHostnameError(cleanHostname);

    if (!finalSlug) {
      setMessage("Branch slug is required.");
      return;
    }

    if (hostError) {
      setMessage(hostError);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setCreatedBranch(null);

      await api.createBranchWithAdmin({
        branchName,
        branchSlug: finalSlug,
        hostname: cleanHostname,
        adminName,
        adminUsername,
        adminEmail,
        adminPassword,
      });

      await qc.invalidateQueries({ queryKey: ["admin-branches"] });

      setCreatedBranch({
        name: branchName.trim(),
        hostname: cleanHostname,
        adminUsername: adminUsername.trim(),
        temporaryPassword: adminPassword,
      });
      setBranchName("");
      setBranchSlug("");
      setHostname("");
      setAdminName("");
      setAdminUsername("");
      setAdminEmail("");
      setAdminPassword("");
      setMessage("Branch and first branch admin created successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to create branch.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (branch: BranchSummary) => {
    setEditingBranchId(branch.id);
    setEditBranch({
      branchName: branch.name,
      branchSlug: branch.slug,
      hostname: branch.hostname,
    });
    setBranchMessages((prev) => ({ ...prev, [branch.id]: "" }));
  };

  const cancelEditing = () => {
    setEditingBranchId(null);
    setEditBranch({ branchName: "", branchSlug: "", hostname: "" });
  };

  const saveBranchEdit = async (branchId: string) => {
    const cleanHostname = normalizeHostnameInput(editBranch.hostname);
    const hostError = getHostnameError(cleanHostname);

    if (hostError) {
      setBranchMessages((prev) => ({ ...prev, [branchId]: hostError }));
      return;
    }

    try {
      setBranchSaving((prev) => ({ ...prev, [branchId]: true }));
      setBranchMessages((prev) => ({ ...prev, [branchId]: "" }));

      await api.updateAdminBranch(branchId, {
        branchName: editBranch.branchName,
        branchSlug: editBranch.branchSlug,
        hostname: cleanHostname,
      });

      await qc.invalidateQueries({ queryKey: ["admin-branches"] });
      setBranchMessages((prev) => ({ ...prev, [branchId]: "Branch details updated." }));
      cancelEditing();
    } catch (error) {
      console.error(error);
      setBranchMessages((prev) => ({
        ...prev,
        [branchId]: error instanceof Error ? error.message : "Failed to update branch.",
      }));
    } finally {
      setBranchSaving((prev) => ({ ...prev, [branchId]: false }));
    }
  };

  const toggleBranchStatus = async (branch: BranchSummary) => {
    const nextStatus = !branch.isActive;

    try {
      setBranchSaving((prev) => ({ ...prev, [branch.id]: true }));
      setBranchMessages((prev) => ({ ...prev, [branch.id]: "" }));

      await api.setAdminBranchStatus(branch.id, nextStatus);
      await qc.invalidateQueries({ queryKey: ["admin-branches"] });

      setBranchMessages((prev) => ({
        ...prev,
        [branch.id]: nextStatus ? "Branch activated." : "Branch deactivated.",
      }));
    } catch (error) {
      console.error(error);
      setBranchMessages((prev) => ({
        ...prev,
        [branch.id]: error instanceof Error ? error.message : "Failed to update branch status.",
      }));
    } finally {
      setBranchSaving((prev) => ({ ...prev, [branch.id]: false }));
    }
  };

  const createAdminForBranch = async (branchId: string) => {
    const state = getInlineState(branchId);

    try {
      setBranchSaving((prev) => ({ ...prev, [branchId]: true }));
      setBranchMessages((prev) => ({ ...prev, [branchId]: "" }));

      await api.createBranchAdmin(branchId, {
        adminName: state.adminName,
        adminUsername: state.adminUsername,
        adminEmail: state.adminEmail,
        adminPassword: state.adminPassword,
      });

      await qc.invalidateQueries({ queryKey: ["admin-branches"] });

      setInlineAdmin((prev) => ({
        ...prev,
        [branchId]: {
          ...getInlineState(branchId),
          adminName: "",
          adminUsername: "",
          adminEmail: "",
          adminPassword: "",
          resetPassword: "",
        },
      }));

      setBranchMessages((prev) => ({
        ...prev,
        [branchId]: "Branch admin created successfully.",
      }));
    } catch (error) {
      console.error(error);
      setBranchMessages((prev) => ({
        ...prev,
        [branchId]: error instanceof Error ? error.message : "Failed to create branch admin.",
      }));
    } finally {
      setBranchSaving((prev) => ({ ...prev, [branchId]: false }));
    }
  };

  const resetPasswordForAdmin = async (branchId: string, userId: string) => {
    const state = getInlineState(branchId);

    try {
      setBranchSaving((prev) => ({ ...prev, [branchId]: true }));
      setBranchMessages((prev) => ({ ...prev, [branchId]: "" }));

      await api.resetBranchAdminPassword(userId, state.resetPassword);

      setInlineAdmin((prev) => ({
        ...prev,
        [branchId]: {
          ...getInlineState(branchId),
          resetPassword: "",
        },
      }));

      setBranchMessages((prev) => ({
        ...prev,
        [branchId]: "Branch admin password reset successfully.",
      }));
    } catch (error) {
      console.error(error);
      setBranchMessages((prev) => ({
        ...prev,
        [branchId]: error instanceof Error ? error.message : "Failed to reset password.",
      }));
    } finally {
      setBranchSaving((prev) => ({ ...prev, [branchId]: false }));
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="w-full rounded-[1.25rem] bg-white/78 p-5 shadow-card border border-border/60 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-8">
        <div className="mb-6">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Onboarding
          </div>
          <h1 className="text-2xl font-display font-bold gradient-text mb-2 sm:text-3xl">
            Branch Onboarding
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Create a branch, attach its hostname, and generate the branch admin account that will
            own it.
          </p>
        </div>

        <form
          className="grid gap-4 lg:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            type="text"
            placeholder="Branch name, e.g. Dang Branch"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
            required
          />

          <input
            type="text"
            placeholder={`Branch slug, e.g. ${suggestedSlug || "dang"}`}
            value={branchSlug}
            onChange={(e) => setBranchSlug(slugify(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          />

          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Hostname, e.g. dang.dripandtrip.local"
              value={hostname}
              onChange={(e) => setHostname(normalizeHostnameInput(e.target.value))}
              className={`w-full px-4 py-3 rounded-2xl bg-background/90 border ${
                hostname && hostnameError ? "border-red-300" : "border-border"
              }`}
              required
            />
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              <span>Local: dang.dripandtrip.local</span>
              <span>Production: dang.dripandtrip.com.np</span>
              <span className="sm:col-span-2">Enter hostname only. No protocol, port, or slash.</span>
            </div>
            {hostname && hostnameError && (
              <p className="mt-2 text-xs text-red-500">{hostnameError}</p>
            )}
          </div>

          <input
            type="text"
            placeholder="Branch admin name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          />

          <input
            type="text"
            placeholder="Branch admin username"
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
            required
          />

          <input
            type="email"
            placeholder="Branch admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          />

          <input
            type="password"
            placeholder="Temporary password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
            required
          />

          <button
            type="submit"
            disabled={saving || Boolean(hostname && hostnameError) || !activeSlug}
            className="lg:col-span-2 w-full py-3 rounded-2xl gradient-button text-primary-foreground shadow-button font-semibold disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Branch and Admin"}
          </button>

          {message && (
            <p className="lg:col-span-2 text-sm text-muted-foreground">{message}</p>
          )}
        </form>

        {createdBranch && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold text-primary">
              <CheckCircle2 className="h-5 w-5" />
              {createdBranch.name} is ready for handoff
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {[
                ["Storefront URL", makeBranchUrl(createdBranch.hostname)],
                ["Admin login URL", makeBranchUrl(createdBranch.hostname, "/login")],
                ["Admin username", createdBranch.adminUsername],
                ["Temporary password", createdBranch.temporaryPassword],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border/70 bg-white/80 p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-1 break-all text-sm font-medium">{value}</div>
                  <button
                    type="button"
                    onClick={() => copyText(value, label)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs hover:border-primary"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {copiedValue && (
          <p className="mt-3 text-xs text-muted-foreground">
            {copiedValue === "Copy failed" ? copiedValue : `${copiedValue} copied.`}
          </p>
        )}
      </div>

      <div className="w-full rounded-[1.25rem] bg-white/78 p-5 shadow-card border border-border/60 backdrop-blur-xl sm:rounded-[1.75rem] sm:p-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text">Existing Branches</h2>
            <p className="text-sm text-muted-foreground">
              Edit hostnames, copy login links, and pause branches without deleting data.
            </p>
          </div>
          {copiedValue && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {copiedValue === "Copy failed" ? copiedValue : `${copiedValue} copied`}
            </div>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading branches...</p>
        ) : branches.length === 0 ? (
          <p className="text-muted-foreground">No branches created yet.</p>
        ) : (
          <div className="grid gap-4">
            {branches.map((branch) => {
              const isEditing = editingBranchId === branch.id;
              const storefrontUrl = makeBranchUrl(branch.hostname);
              const loginUrl = makeBranchUrl(branch.hostname, "/login");

              return (
                <div
                  key={branch.id}
                  className="rounded-[1.25rem] border border-border/80 bg-white/90 p-5 space-y-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold leading-tight">{branch.name}</div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                            branch.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {branch.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="mt-1 break-all text-sm font-medium text-slate-700">
                        {branch.hostname}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">slug: {branch.slug}</div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(branch)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm hover:border-primary"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={branchSaving[branch.id]}
                        onClick={() => toggleBranchStatus(branch)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm disabled:opacity-50 ${
                          branch.isActive
                            ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        <Power className="h-4 w-4" />
                        {branch.isActive ? "Pause" : "Activate"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl border border-border/70 bg-slate-50/80 p-3">
                      <div className="text-xs text-muted-foreground">Products</div>
                      <div className="font-semibold">{branch._count?.products ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-slate-50/80 p-3 sm:col-span-2">
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="font-semibold">{formatDate(branch.createdAt)}</div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm hover:border-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Store
                    </a>
                    <a
                      href={loginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm hover:border-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Login
                    </a>
                    <button
                      type="button"
                      onClick={() => copyText(storefrontUrl, "Storefront URL")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm hover:border-primary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Store
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(loginUrl, "Admin login URL")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm hover:border-primary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Login
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 rounded-xl border border-primary/20 bg-slate-50/80 p-4">
                      <input
                        type="text"
                        value={editBranch.branchName}
                        onChange={(e) =>
                          setEditBranch((prev) => ({ ...prev, branchName: e.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-white px-3 py-2"
                      />
                      <input
                        type="text"
                        value={editBranch.branchSlug}
                        onChange={(e) =>
                          setEditBranch((prev) => ({
                            ...prev,
                            branchSlug: slugify(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-border bg-white px-3 py-2"
                      />
                      <input
                        type="text"
                        value={editBranch.hostname}
                        onChange={(e) =>
                          setEditBranch((prev) => ({
                            ...prev,
                            hostname: normalizeHostnameInput(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-border bg-white px-3 py-2"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={branchSaving[branch.id]}
                          onClick={() => saveBranchEdit(branch.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="text-sm font-medium text-slate-700">
                    Branch admin:{" "}
                    {branch.users?.length
                      ? branch.users.map((user) => user.username).join(", ")
                      : "No branch admin assigned"}
                  </div>

                  {branch.users?.length ? (
                    <div className="space-y-3">
                      {branch.users.map((user) => (
                        <div
                          key={user.id}
                          className="rounded-xl border border-border/70 bg-slate-50/80 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="font-semibold">{user.name || user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.username}</div>
                              <div className="text-xs text-muted-foreground">
                                Last login: {formatDate(user.lastLoginAt)}
                              </div>
                            </div>
                            <div className="w-fit rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                              Recovery
                            </div>
                          </div>

                          {user.email && (
                            <div className="mt-1 break-all text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          )}

                          <div className="mt-4">
                            <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-white sm:grid-cols-[minmax(0,1fr)_92px]">
                              <input
                                type="password"
                                placeholder="Temporary reset password"
                                value={getInlineState(branch.id).resetPassword}
                                onChange={(e) =>
                                  updateInlineState(branch.id, "resetPassword", e.target.value)
                                }
                                className="min-w-0 border-0 bg-white px-3 py-2.5 text-sm outline-none"
                              />
                              <button
                                type="button"
                                disabled={branchSaving[branch.id]}
                                onClick={() => resetPasswordForAdmin(branch.id, user.id)}
                                className="border-t border-border bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 sm:border-l sm:border-t-0"
                              >
                                Save
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Use only when this branch admin loses access.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-dashed border-border bg-slate-50/70 p-4">
                      <div className="text-sm font-medium">Assign branch admin</div>
                      <input
                        type="text"
                        placeholder="Admin name"
                        value={getInlineState(branch.id).adminName}
                        onChange={(e) => updateInlineState(branch.id, "adminName", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border"
                      />
                      <input
                        type="text"
                        placeholder="Admin username"
                        value={getInlineState(branch.id).adminUsername}
                        onChange={(e) =>
                          updateInlineState(branch.id, "adminUsername", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border"
                      />
                      <input
                        type="email"
                        placeholder="Admin email"
                        value={getInlineState(branch.id).adminEmail}
                        onChange={(e) => updateInlineState(branch.id, "adminEmail", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border"
                      />
                      <input
                        type="password"
                        placeholder="Temporary password"
                        value={getInlineState(branch.id).adminPassword}
                        onChange={(e) =>
                          updateInlineState(branch.id, "adminPassword", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-border"
                      />
                      <button
                        type="button"
                        disabled={branchSaving[branch.id]}
                        onClick={() => createAdminForBranch(branch.id)}
                        className="w-full py-2 rounded-xl border border-border bg-white hover:border-primary transition disabled:opacity-50"
                      >
                        Create Branch Admin
                      </button>
                    </div>
                  )}

                  {branchMessages[branch.id] && (
                    <p className="text-xs text-muted-foreground">{branchMessages[branch.id]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
