export const PRODUCT_VISIBILITY_EVENT_KEY = "product_visibility_changed";

type ProductVisibilityEvent = {
  productId: string;
  isVisible: boolean;
  changedAt: number;
};

export const broadcastProductVisibilityChange = (event: Omit<ProductVisibilityEvent, "changedAt">) => {
  localStorage.setItem(
    PRODUCT_VISIBILITY_EVENT_KEY,
    JSON.stringify({
      ...event,
      changedAt: Date.now(),
    })
  );
};

export const parseProductVisibilityEvent = (value: string | null): ProductVisibilityEvent | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ProductVisibilityEvent>;

    if (typeof parsed.productId !== "string" || typeof parsed.isVisible !== "boolean") {
      return null;
    }

    return {
      productId: parsed.productId,
      isVisible: parsed.isVisible,
      changedAt: typeof parsed.changedAt === "number" ? parsed.changedAt : Date.now(),
    };
  } catch {
    return null;
  }
};
