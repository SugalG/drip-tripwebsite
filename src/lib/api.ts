const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = {
  getProducts: async () => {
    const res = await fetch(`${BACKEND_URL}/api/products`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch Products");
    return res.json();
  },

  uploadImages: async (formData: FormData) => {
    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    return { res, data };
  },

  saveProduct: async (payload: any, id?: string | null) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `${BACKEND_URL}/api/products/${id}` : `${BACKEND_URL}/api/products`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return { res, data };
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  },

  logout: async () => {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },
};