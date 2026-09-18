import { useMemo } from "react";
import { getCountries } from "react-phone-number-input";

// Full country list (~240 entries) sourced from the same libphonenumber-js
// metadata react-phone-number-input already ships — not a hand-maintained
// subset. Intl.DisplayNames (native ECMA-402, no extra dependency) supplies
// the readable name per ISO code. Shared by GuestContactForm.tsx (checkout)
// and the addresses form (account) so the list-building logic lives once.
export interface CountryOption {
  code: string;
  name: string;
}

export function useCountryOptions(): CountryOption[] {
  return useMemo(() => {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return getCountries()
      .map((code) => ({ code, name: displayNames.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}
