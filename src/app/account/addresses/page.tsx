"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import { useCountryOptions } from "@/lib/countries";
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
import { Spinner } from "@/components/ui/spinner";
import type { AddressVM } from "@/types/view/customer";
import type { AddressInput } from "@/lib/api/customer-account";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

// Guide references an `address_type` enum without listing values — these
// are the standard e-commerce split; adjust if the backend's validation
// error ever names different accepted values.
const ADDRESS_TYPES = [
  { value: "shipping", label: "Shipping" },
  { value: "billing", label: "Billing" },
];

const EMPTY_FORM: AddressInput = {
  type: "shipping",
  street: "",
  city: "",
  country: "AO",
  state: "",
  zipcode: "",
};

export default function AddressesPage() {
  const router = useRouter();
  const {
    customer,
    isLoading,
    isBusy,
    error,
    clearError,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useCustomerAuth();
  const countryOptions = useCountryOptions();
  const countryItems = countryOptions.map((c) => ({ value: c.code, label: c.name }));

  const [addresses, setAddresses] = useState<AddressVM[] | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);

  useEffect(() => {
    if (!isLoading && !customer) router.replace("/login");
  }, [isLoading, customer, router]);

  useEffect(() => {
    if (customer) getAddresses().then(setAddresses);
  }, [customer, getAddresses]);

  if (isLoading || !customer) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-5 w-5 text-neutral-400" />
      </div>
    );
  }

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId("new");
    clearError();
  }

  function startEdit(addr: AddressVM) {
    setForm({
      type: addr.type,
      street: addr.street,
      city: addr.city,
      country: addr.country,
      state: addr.state ?? "",
      zipcode: addr.zipcode ?? "",
    });
    setEditingId(addr.id);
    clearError();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId === "new") {
      const created = await createAddress(form);
      if (created) {
        setAddresses((prev) => [...(prev ?? []), created]);
        setEditingId(null);
      }
    } else if (editingId) {
      const updated = await updateAddress(editingId, form);
      if (updated) {
        setAddresses((prev) => (prev ?? []).map((a) => (a.id === editingId ? updated : a)));
        setEditingId(null);
      }
    }
  }

  async function handleDelete(id: string) {
    if (await deleteAddress(id)) {
      setAddresses((prev) => (prev ?? []).filter((a) => a.id !== id));
    }
  }

  const selectedCountryItem = countryItems.find((c) => c.value === form.country) ?? null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Addresses</h1>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {addresses === null ? (
        <p className="mt-8 text-sm text-neutral-500">Loading…</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {addresses.map((addr) => (
            <li key={addr.id} className="border border-neutral-200 p-4">
              <p className={LABEL}>{addr.type}</p>
              <p className="mt-1 text-sm text-neutral-900">{addr.street}</p>
              <p className="text-sm text-neutral-900">
                {addr.city}
                {addr.state ? `, ${addr.state}` : ""} {addr.zipcode ?? ""}
              </p>
              <p className="text-sm text-neutral-900">{addr.country}</p>
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => startEdit(addr)}
                  className="text-xs text-neutral-500 underline hover:text-black"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={isBusy}
                  className="text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          {addresses.length === 0 && <p className="text-sm text-neutral-500">No addresses saved yet.</p>}
        </ul>
      )}

      {editingId === null ? (
        <button
          type="button"
          onClick={startAdd}
          className="mt-8 border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
        >
          Add Address
        </button>
      ) : (
        <form onSubmit={handleSave} className="mt-8 space-y-4 border-t border-neutral-200 pt-8">
          <div>
            <label className={LABEL} htmlFor="address-type">
              Type
            </label>
            <select
              id="address-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={FIELD}
            >
              {ADDRESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="address-street">
              Street
            </label>
            <input
              id="address-street"
              required
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="address-city">
              City
            </label>
            <input
              id="address-city"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="address-state">
              State / Province
            </label>
            <input
              id="address-state"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="address-zipcode">
              Postal Code
            </label>
            <input
              id="address-zipcode"
              value={form.zipcode}
              onChange={(e) => setForm((f) => ({ ...f, zipcode: e.target.value }))}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Country</label>
            <Combobox
              items={countryItems}
              value={selectedCountryItem}
              onValueChange={(item) => setForm((f) => ({ ...f, country: item?.value ?? "AO" }))}
            >
              <ComboboxInputGroup className={FIELD}>
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="flex-1 border border-neutral-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-700 hover:border-neutral-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
