"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import AnnouncementBar from "./AnnouncementBar";
import type { AnnouncementApi } from "@/types/api/announcement";
import type { CategoryApi } from "@/types/api/category";
import { resolveCollectionHref } from "@/lib/api/resolve-href";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

// The API's category `name` ("Sneakers") doesn't match the real, pixel-
// verified header label ("Footwear") for that section on hypmiami.com — keep
// the label mapping local, only source structure/existence from the API.
const NAV_LABEL_OVERRIDES: Record<string, string> = {
  sneakers: "Footwear",
};

// Used only if the API is unreachable at request time (getCategories() then
// resolves to []) — primary nav must never fully disappear.
const FALLBACK_CATEGORY_ITEMS: NavItem[] = [
  { label: "Footwear", href: "/collections/sneakers" },
  { label: "Apparel", href: "/collections/apparel" },
  { label: "Accessories", href: "/collections/accessories" },
];

// Institutional pages have no backend endpoint (guide §12) — stay static.
const STATIC_NAV_ITEMS: NavItem[] = [
  { label: "Contact", href: "/contact" },
  { label: "Locations", href: "/locations" },
  { label: "Sell", href: "https://model-r.lovable.app/hypmiami", external: true },
  { label: "Inquire", href: "/inquire" },
];

function buildNavItems(categories: CategoryApi[]): NavItem[] {
  const categoryItems = categories
    .filter((c) => c.parentId === null)
    .flatMap((c): NavItem[] => {
      const href = resolveCollectionHref(c.slug);
      if (!href) return [];
      return [{ label: NAV_LABEL_OVERRIDES[c.slug] ?? c.name, href }];
    });

  return [...(categoryItems.length > 0 ? categoryItems : FALLBACK_CATEGORY_ITEMS), ...STATIC_NAV_ITEMS];
}

export default function Header({
  categories,
  announcements,
}: {
  categories: CategoryApi[];
  announcements: AnnouncementApi[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const NAV_ITEMS = buildNavItems(categories);

  return (
    <header className="sticky top-0 z-50 bg-white text-black">
      <AnnouncementBar announcements={announcements} />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/hyp-logo-alt.png" alt="HYP" width={70} height={56} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wide md:flex">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-black/60">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className="hover:text-black/60">
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/account" aria-label="Account" className="hidden sm:block">
            <AccountIcon />
          </Link>
          <Link href="/search" aria-label="Search" className="hidden sm:block">
            <SearchIcon />
          </Link>
          <Link href="/cart" aria-label="Cart">
            <CartIcon />
          </Link>
          <button className="md:hidden" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/10 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-wide md:hidden">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-black/80 hover:text-black"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="py-2 text-black/80 hover:text-black"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
