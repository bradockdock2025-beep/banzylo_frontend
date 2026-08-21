export default function InquirePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-neutral-900">Inquire</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Looking to sell or consign sneakers, apparel, or accessories? Tell us about the item.
      </p>

      <form className="mt-10 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" />
          <Field label="E-mail" name="email" type="email" />
        </div>
        <Field label="Item / Brand" name="item" />
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-900" htmlFor="note">
            Order note
          </label>
          <textarea
            id="note"
            name="note"
            rows={6}
            placeholder="Condition, size, and any details about the item"
            className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="border border-black bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-neutral-800"
        >
          Submit Inquiry
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-900" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
      />
    </div>
  );
}
