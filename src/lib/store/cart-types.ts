export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

export type AppliedCartCoupon = {
  code: string;
  couponId: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number | null;
};

export type CartState = {
  items: CartItem[];
  appliedCoupon?: AppliedCartCoupon | null;
};
