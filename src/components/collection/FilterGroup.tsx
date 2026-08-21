"use client";

import { useState } from "react";

export default function FilterGroup({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-neutral-900"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
