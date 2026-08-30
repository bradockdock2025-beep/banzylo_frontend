"use client";

import { useState } from "react";

// Shipping / Returns / Authenticity Guarantee disclosure block on the
// product detail page. Copy is the site-wide policy text taken verbatim from
// the reference product page (it is not per-product data). Visual language
// matches the sidebar's FilterGroup accordion (border-b rows, uppercase
// label, rotating chevron).

function AccordionRow({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-neutral-900"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className="text-base leading-none text-neutral-500">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">{children}</div>
      )}
    </div>
  );
}

export default function ProductInfoAccordions() {
  return (
    <div className="mt-10 border-t border-neutral-200">
      <AccordionRow label="Shipping">
        <p className="font-semibold text-neutral-900">1. Domestic Shipping Options</p>
        <p>We offer the following domestic shipping options within the United States:</p>
        <p>
          <span className="font-semibold text-neutral-900">Standard Shipping (UPS):</span>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cost: $10</li>
          <li>
            Delivery Time: Estimated delivery within 2-5 business days from the date of shipment.
          </li>
          <li>Carrier: United Parcel Service (UPS)</li>
        </ul>
        <p>
          <span className="font-semibold text-neutral-900">Express Shipping (UPS 2 Day Air):</span>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cost: $25</li>
          <li>
            Delivery Time: Estimated delivery within 2 business days from the date of shipment.
          </li>
          <li>Carrier: United Parcel Service (UPS)</li>
        </ul>
        <p>
          <span className="font-semibold text-neutral-900">
            Free Express Shipping (Orders over $500):
          </span>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Orders totaling $500 or more qualify for free express shipping via UPS 2 Day Air.</li>
          <li>
            Delivery Time: Estimated delivery within 2 business days from the date of shipment.
          </li>
          <li>Carrier: United Parcel Service (UPS)</li>
        </ul>
        <p className="font-semibold text-neutral-900">2. International Shipping</p>
        <p>
          For international orders, shipping fees will be calculated during the checkout process. The
          exact cost will depend on the destination country, the shipping method selected, and the
          weight and dimensions of the items in your order.
        </p>
        <p>
          Please note that customers are responsible for any customs duties, taxes, or fees imposed by
          their respective countries.
        </p>
      </AccordionRow>

      <AccordionRow label="Returns">
        <p>No returns or exchanges. All sales are final and no refund will be issued.</p>
      </AccordionRow>

      <AccordionRow label="Authenticity Guarantee">
        <p>
          We guarantee the authenticity of every product by sourcing directly from authorized
          suppliers and conducting rigorous quality control to ensure that each item meets our strict
          standards. Shop with confidence at HŸP, knowing all purchases are 100% authentic
          guaranteed.
        </p>
      </AccordionRow>
    </div>
  );
}
