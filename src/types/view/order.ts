// Normalized shapes the checkout UI consumes — adapted once in
// src/lib/api/orders.ts from OrderApi (raw API DTOs), same api/ -> view/
// split already used for catalog/product-detail/cart.

export interface OrderQuoteLineVM {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderQuoteVM {
  items: OrderQuoteLineVM[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  isPresaleOrder: boolean;
}

export interface CreateGuestOrderVM {
  orderId: string;
  orderNumber: string;
  guestToken: string;
  clientSecret: string;
  publishableKey: string;
}

export interface GuestOrderLineVM {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface GuestOrderVM {
  id: string;
  orderNumber: string;
  status: string;
  items: GuestOrderLineVM[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  country: string;
  paymentStatus: string | null;
  createdAt: string;
}
