const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";

const jsonRequest = async (input: string, init?: RequestInit) => {
  const res = await fetch(`${API_BASE_URL}${input}`, {
    credentials: "include",
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
};

export const api = {
  getCurrentBranch: async () => {
    const { res, data } = await jsonRequest("/api/branches/current");
    if (!res.ok) throw new Error(data?.error || "Failed to fetch branch");
    return data;
  },

  updateCurrentBranch: async (payload: {
    name: string;
    address: string;
    phone: string;
    email: string;
    whatsappNumber: string;
    mapEmbedUrl: string;
    storeHours: string;
  }) => {
    const { res, data } = await jsonRequest("/api/branches/current", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(data?.error || data?.message || "Failed to update branch");
    return data;
  },

  getProducts: async () => {
    const { res, data } = await jsonRequest("/api/products");
    if (!res.ok) throw new Error(data?.error || "Failed to fetch products");
    return data;
  },

  getProduct: async (id: string) => {
    const { res, data } = await jsonRequest(`/api/products/${id}`);
    if (!res.ok) throw new Error(data?.error || "Failed to fetch product");
    return data;
  },

  getCurrentUser: async () => {
    const { res, data } = await jsonRequest("/api/auth/me");
    if (!res.ok) throw new Error(data?.message || "Not authenticated");
    return data;
  },

  getAdminBranches: async () => {
    const { res, data } = await jsonRequest("/api/admin/branches");
    if (!res.ok) throw new Error(data?.error || "Failed to fetch branches");
    return data;
  },

  createBranchWithAdmin: async (payload: {
    branchName: string;
    branchSlug: string;
    hostname: string;
    adminName: string;
    adminUsername: string;
    adminEmail: string;
    adminPassword: string;
  }) => {
    const { res, data } = await jsonRequest("/api/admin/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(data?.error || "Failed to create branch");
    return data;
  },

  createBranchAdmin: async (
    branchId: string,
    payload: {
      adminName: string;
      adminUsername: string;
      adminEmail: string;
      adminPassword: string;
    }
  ) => {
    const { res, data } = await jsonRequest(`/api/admin/branches/${branchId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(data?.error || "Failed to create branch admin");
    return data;
  },

  updateAdminBranch: async (
    branchId: string,
    payload: {
      branchName: string;
      branchSlug: string;
      hostname: string;
    }
  ) => {
    const { res, data } = await jsonRequest(`/api/admin/branches/${branchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(data?.error || "Failed to update branch");
    return data;
  },

  setAdminBranchStatus: async (branchId: string, isActive: boolean) => {
    const { res, data } = await jsonRequest(`/api/admin/branches/${branchId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error(data?.error || "Failed to update branch status");
    return data;
  },

  resetBranchAdminPassword: async (userId: string, newPassword: string) => {
    const { res, data } = await jsonRequest(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) throw new Error(data?.error || "Failed to reset password");
    return data;
  },

  login: async (payload: { username: string; password: string }) => {
    const { res, data } = await jsonRequest("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    return data;
  },

  uploadImages: async (formData: FormData) => {
    return jsonRequest("/api/upload", {
      method: "POST",
      body: formData,
    });
  },

  saveProduct: async (payload: any, id?: string | null) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/products/${id}` : "/api/products";

    return jsonRequest(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (id: string) => {
    return jsonRequest(`/api/products/${id}`, {
      method: "DELETE",
    });
  },

  logout: async () => {
    await jsonRequest("/api/auth/logout", {
      method: "POST",
    });
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { res, data } = await jsonRequest("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(data?.message || "Failed to change password");
    return data;
  },
};
