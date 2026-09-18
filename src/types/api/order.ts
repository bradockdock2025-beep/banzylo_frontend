// Shape of the guest checkout endpoints (GUIA-INTEGRACAO-AUTENTICACAO.md §7,
// GUIA-INTEGRACAO-COMPRA.md §1). Guest-only for now — the logged-in
// `/customers/orders*` variant is a separate, deferred integration.
//
// Money fields come back as numeric strings ("300", "0"), not JSON numbers —
// confirmed live 2026-09-17, same Postgres-decimal quirk already handled in
// product-detail.ts/catalog.ts. Typed `string` here on purpose; orders.ts
// does the Number(...) conversion when building the view models.

export interface OrderQuoteItemApi {
  variantId: string;
  productId: string;
  categoryId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  weightKg: string | null;
  isPresale: boolean;
}

// GET /orders/guest/quote?country=XX
export interface GuestOrderQuoteApi {
  items: OrderQuoteItemApi[];
  subtotal: string;
  shippingAmount: string;
  totalAmount: string;
  isPresaleOrder: boolean;
}

// POST /orders/guest response
export interface CreateGuestOrderApi {
  orderId: string;
  orderNumber: string;
  guestToken: string;
  clientSecret: string;
  publishableKey: string;
}

export interface GuestOrderItemApi {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface GuestOrderPaymentApi {
  status: string;
  method: string;
}

// Only `country` is populated until the Stripe webhook fills the rest in
// after payment succeeds (name/email/full address come from what Stripe
// Elements captured — see GUIA-INTEGRACAO-COMPRA.md §5).
export interface GuestOrderShippingAddressApi {
  country: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

// GET /orders/guest/:id?token=<guestToken>
export interface GuestOrderApi {
  id: string;
  orderNumber: string;
  status: string;
  items: GuestOrderItemApi[];
  subtotal: string;
  shippingAmount: string;
  totalAmount: string;
  shippingAddress: GuestOrderShippingAddressApi;
  payment: GuestOrderPaymentApi | null;
  createdAt: string;
}
