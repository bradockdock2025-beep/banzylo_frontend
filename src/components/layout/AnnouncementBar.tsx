import type { AnnouncementApi } from "@/types/api/announcement";

export default function AnnouncementBar({ announcements }: { announcements: AnnouncementApi[] }) {
  if (announcements.length === 0) return null;

  const text = announcements
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((a) => a.text)
    .join("   |   ");

  return (
    <div className="overflow-hidden bg-black py-2 text-white">
      <div className="animate-marquee whitespace-nowrap text-center text-[11px] font-medium uppercase tracking-wide">
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
}
