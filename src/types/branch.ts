export interface Branch {
  id: string;
  name: string;
  slug: string;
  hostname: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  mapEmbedUrl: string | null;
  storeHours: string | null;
  settings: Record<string, unknown> | null;
}
