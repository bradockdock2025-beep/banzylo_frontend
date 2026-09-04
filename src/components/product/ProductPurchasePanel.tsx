"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { ProductDetailVM } from "@/types/view/product-detail";
import { LOCATIONS } from "@/data/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/components/providers/CartProvider";
import ProductInfoAccordions from "./ProductInfoAccordions";

// Right column of the product detail page. All product data comes from the
// API (ProductDetailVM); the size selector is variant-driven and holds the
// variantId the cart / Make Offer will use in a later phase. The cart itself
// is not integrated yet (see src/app/cart/page.tsx), so the CTAs keep the
// reference layout's styling without a checkout handler.
//
// Store pickup / policy copy / installments are NOT in the API — kept static
// (see PRODUCT-DETAIL-INTEGRACAO/PLANO-INTEGRACAO-PRODUCT-DETAIL.md §5).
const PICKUP_STORE = LOCATIONS.find((l) => l.name.includes("World Center")) ?? LOCATIONS[0];

const FIELD_LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
// Minimalist: square corners, thin neutral border, compact height.
// Size/Condition triggers only hold a short word ("XL", "New") — a fixed
// compact width instead of stretching full-width.
const SELECT_CONTROL = "mt-2 h-10 w-28 rounded-none border-neutral-300 text-sm";

export default function ProductPurchasePanel({ product }: { product: ProductDetailVM }) {
  const { variants } = product;
  const hasSizes = variants.some((v) => v.sizeLabel !== "");
  const { addItem, isBusy } = useCart();

  const [variantId, setVariantId] = useState(
    variants.length === 1 ? variants[0].id : ""
  );
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const canAddToCart = !!selected && selected.available && selected.purchaseMode === "normal";

  const conditions = useMemo(() => {
    const found = [...new Set(variants.map((v) => v.condition).filter((c): c is string => !!c))];
    return found.length > 0 ? found : ["New"];
  }, [variants]);
  const [condition, setCondition] = useState(conditions[0]);

  const price = selected?.price ?? product.priceFrom;
  const compareAt = selected?.compareAtPrice ?? product.compareAtPriceFrom;
  const installment = price / 4;
  const maxQuantity = selected ? Math.max(1, selected.availableQuantity) : 99;

  return (
    <div className="lg:max-w-md">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brandName}</p>
      <h1 className="mt-1 text-2xl font-medium leading-snug text-neutral-900">{product.name}</h1>

      {product.productFacets.length > 0 && (
        <p className="mt-2 text-xs text-neutral-500">
          {product.productFacets.map((f) => `${f.name}: ${f.label}`).join(" · ")}
        </p>
      )}

      <p className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-medium text-neutral-900">${price.toFixed(2)}</span>
        {compareAt != null && compareAt > price && (
          <span className="text-lg text-neutral-400 line-through">${compareAt.toFixed(2)}</span>
        )}
      </p>

      {hasSizes && (
        <div className="mt-8 flex gap-4">
          <div>
            <label className={FIELD_LABEL}>Size:</label>
            {/* `items` maps variantId -> label so the trigger shows "EU 42",
                not the raw id (Base UI Select resolves the value against it). */}
            <Select
              value={variantId}
              onValueChange={(v) => setVariantId(v ?? "")}
              items={variants.map((v) => ({ value: v.id, label: v.sizeLabel || "One Size" }))}
            >
              <SelectTrigger className={SELECT_CONTROL}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => {
                  const soldOut = !v.available || v.purchaseMode !== "normal";
                  return (
                    <SelectItem key={v.id} value={v.id} disabled={soldOut}>
                      {v.sizeLabel || "One Size"}
                      {soldOut ? " — Sold out" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <ConditionSelect conditions={conditions} value={condition} onChange={setCondition} />
        </div>
      )}

      <div className="mt-6">
        <p className={FIELD_LABEL}>Quantity</p>
        <div className="mt-2 flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-none border-neutral-300"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <Input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value) || 1)))
            }
            aria-label="Quantity"
            className="h-10 w-12 rounded-none border-x-0 border-neutral-300 text-center text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-none border-neutral-300"
            aria-label="Increase quantity"
            disabled={quantity >= maxQuantity}
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {!hasSizes && (
        <div className="mt-6 flex gap-4">
          <ConditionSelect conditions={conditions} value={condition} onChange={setCondition} />
        </div>
      )}

      <button
        type="button"
        disabled={!canAddToCart || isBusy}
        onClick={() => selected && addItem(selected.id, quantity)}
        className="mt-6 w-full border border-neutral-900 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 disabled:hover:bg-white disabled:hover:text-neutral-400"
      >
        {isBusy ? "Adding…" : "Add to Cart"}
      </button>
      {hasSizes && !variantId && (
        <p className="mt-2 text-xs text-neutral-500">Select a size to add to cart.</p>
      )}
      <button
        type="button"
        className="mt-3 w-full rounded-sm bg-[#5a31f4] px-6 py-4 text-sm font-medium text-white hover:bg-[#4a27d4]"
      >
        Buy with Shop
      </button>
      <button type="button" className="mt-3 block w-full text-center text-xs text-neutral-500 underline">
        More payment options
      </button>

      <p className="mt-4 text-xs text-neutral-500">
        4 interest-free installments, or from ${installment.toFixed(2)}/mo with Shop
      </p>

      <p className="mt-3 flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-neutral-900">
        <span aria-hidden>⚡</span> Ships same or next day · Next day air available
      </p>

      <div className="mt-4 text-sm">
        <p className="text-neutral-900">Pickup available at HYP - {PICKUP_STORE.name}</p>
        <p className="text-neutral-500">Usually ready in 2 hours</p>
      </div>

      <ProductInfoAccordions />
    </div>
  );
}

function ConditionSelect({
  conditions,
  value,
  onChange,
}: {
  conditions: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={FIELD_LABEL}>Condition:</label>
      <Select value={value} onValueChange={(v) => onChange(v ?? conditions[0])}>
        <SelectTrigger className={SELECT_CONTROL}>
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          {conditions.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
