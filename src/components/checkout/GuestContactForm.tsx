"use client";

import { useMemo, useState } from "react";
import PhoneInput, { isValidPhoneNumber, getCountries, type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

// Backend expects a bare ISO 3166-1 alpha-2 `country` param (2 letters, see
// GUIA-INTEGRACAO-AUTENTICACAO.md §7) — Banzylo is Angola-focused, so that's
// the default here too.
const DEFAULT_COUNTRY: Country = "AO";

const LABEL = "block text-xs text-neutral-500";
const UNDERLINE_FIELD =
  "mt-1 w-full border-0 border-b border-neutral-300 bg-transparent pb-2 text-base text-neutral-900 outline-none focus:border-neutral-900";

// Full country list (~240 entries) sourced from the same libphonenumber-js
// metadata react-phone-number-input uses for its own country/dial-code
// picker — not a hand-maintained subset. Intl.DisplayNames (native
// ECMA-402, no extra dependency) supplies the readable name per ISO code.
function useCountryOptions() {
  return useMemo(() => {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return getCountries()
      .map((code) => ({ code, name: displayNames.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

export default function GuestContactForm({
  onSubmit,
  isSubmitting,
  error,
  disabled,
}: {
  onSubmit: (input: { phone: string; country: string }) => void;
  isSubmitting: boolean;
  error: string | null;
  /** true when the cart has an unavailable line — quoting would fail anyway. */
  disabled?: boolean;
}) {
  const countryOptions = useCountryOptions();
  const countryItems = useMemo(
    () => countryOptions.map((c) => ({ value: c.code, label: c.name })),
    [countryOptions]
  );
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const selectedCountryItem = countryItems.find((c) => c.value === country) ?? null;
  const [phone, setPhone] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // isValidPhoneNumber does real per-country validation (libphonenumber-js
    // metadata), not a generic length/prefix regex — still compatible with
    // the backend's own /^\+?[1-9]\d{6,14}$/ check since a valid E.164
    // number always satisfies it.
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Enter a valid phone number for the selected country.");
      return;
    }
    setPhoneError(null);
    onSubmit({ phone, country });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <label className={LABEL}>Country / Region</label>
        <Combobox
          items={countryItems}
          value={selectedCountryItem}
          onValueChange={(item) => setCountry((item?.value as Country | undefined) ?? DEFAULT_COUNTRY)}
        >
          <ComboboxInputGroup className={UNDERLINE_FIELD}>
            <ComboboxInput placeholder="Search country…" />
            <ComboboxTrigger />
          </ComboboxInputGroup>
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {(item: { value: string; label: string }) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div>
        <label className={LABEL} htmlFor="checkout-phone">
          Phone
        </label>
        <PhoneInput
          id="checkout-phone"
          international
          defaultCountry={DEFAULT_COUNTRY}
          value={phone}
          onChange={(v) => {
            setPhone(v);
            setPhoneError(null);
          }}
          className="checkout-phone-input mt-1"
        />
        <p className="mt-1 text-xs text-neutral-400">Pick your country&apos;s flag, then enter the number.</p>
        {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="w-full bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Processing…" : "Continue to Payment"}
      </button>
    </form>
  );
}
