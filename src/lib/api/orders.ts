import { apiFetch } from "./http";
import type {
  GuestOrderQuoteApi,
  CreateGuestOrderApi,
  GuestOrderApi,
} from "@/types/api/order";
import type { OrderQuoteVM, CreateGuestOrderVM, GuestOrderVM } from "@/types/view/order";

// Guest checkout (GUIA-INTEGRACAO-AUTENTICACAO.md §7, GUIA-INTEGRACAO-COMPRA.md
// §1). Called only from the client (checkout page) — like cart.ts, these DO
// NOT swallow errors: the UI needs ApiError.code (CART_EMPTY,
// ITEMS_UNAVAILABLE, INSUFFICIENT_STOCK, ...) to react per-case.

function toQuoteVM(api: GuestOrderQuoteApi): OrderQuoteVM {
  return {
    items: api.items.map((it) => ({
      variantId: it.variantId,
      productName: it.productName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.totalPrice),
    })),
    subtotal: Number(api.subtotal),
    shippingAmount: Number(api.shippingAmount),
    totalAmount: Number(api.totalAmount),
    isPresaleOrder: api.isPresaleOrder,
  };
}

export async function getGuestQuote(cartToken: string, country: string): Promise<OrderQuoteVM> {
  const api = await apiFetch<GuestOrderQuoteApi>(
    `/orders/guest/quote?country=${encodeURIComponent(country)}`,
    { headers: { "x-cart-token": cartToken }, revalidate: false }
  );
  return toQuoteVM(api);
}

export async function createGuestOrder(
  cartToken: string,
  input: { phone: string; country: string; locale?: string }
): Promise<CreateGuestOrderVM> {
  const api = await apiFetch<CreateGuestOrderApi>("/orders/guest", {
    method: "POST",
    headers: { "x-cart-token": cartToken },
    body: JSON.stringify(input),
    revalidate: false,
  });
  return {
    orderId: api.orderId,
    orderNumber: api.orderNumber,
    guestToken: api.guestToken,
    clientSecret: api.clientSecret,
    publishableKey: api.publishableKey,
  };
}

export async function getGuestOrder(orderId: string, guestToken: string): Promise<GuestOrderVM> {
  const api = await apiFetch<GuestOrderApi>(
    `/orders/guest/${orderId}?token=${encodeURIComponent(guestToken)}`,
    { revalidate: false }
  );
  return {
    id: api.id,
    orderNumber: api.orderNumber,
    status: api.status,
    items: api.items.map((it) => ({
      variantId: it.variantId,
      productName: it.productName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.totalPrice),
    })),
    subtotal: Number(api.subtotal),
    shippingAmount: Number(api.shippingAmount),
    totalAmount: Number(api.totalAmount),
    country: api.shippingAddress?.country ?? "",
    paymentStatus: api.payment?.status ?? null,
    createdAt: api.createdAt,
  };
}
