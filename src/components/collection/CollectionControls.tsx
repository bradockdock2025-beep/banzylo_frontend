"use client";

export type GridDensity = 2 | 3 | "list";

export default function CollectionControls({
  density,
  onDensityChange,
}: {
  density: GridDensity;
  onDensityChange: (density: GridDensity) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl border-b border-neutral-200 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-neutral-400">
          <button
            aria-label="Large grid"
            onClick={() => onDensityChange(2)}
            className={density === 2 ? "text-black" : "hover:text-neutral-600"}
          >
            <GridIcon cols={2} />
          </button>
          <button
            aria-label="Small grid"
            onClick={() => onDensityChange(3)}
            className={density === 3 ? "text-black" : "hover:text-neutral-600"}
          >
            <GridIcon cols={3} />
          </button>
          <button
            aria-label="List view"
            onClick={() => onDensityChange("list")}
            className={density === "list" ? "text-black" : "hover:text-neutral-600"}
          >
            <ListIcon />
          </button>
        </div>

        <button className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-900">
          Sort By <span aria-hidden>⌄</span>
        </button>
      </div>
    </div>
  );
}

function GridIcon({ cols }: { cols: 2 | 3 }) {
  const size = cols === 2 ? 8 : 5;
  const gap = 1.5;
  const boxes = Array.from({ length: cols * cols });
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {boxes.map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return (
          <rect
            key={i}
            x={col * (size + gap)}
            y={row * (size + gap)}
            width={size}
            height={size}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
