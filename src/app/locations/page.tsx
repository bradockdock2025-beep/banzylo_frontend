import { LOCATIONS } from "@/data/locations";

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-neutral-900">Locations</h1>
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {LOCATIONS.map((loc) => (
          <div key={loc.name} className="border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900">{loc.name}</h2>
            <div className="mt-4 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">Address</p>
              {loc.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="mt-4 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">Hours</p>
              {loc.hours.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Store Number: </span>
              {loc.phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
