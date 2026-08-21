const MESSAGES = [
  "FREE SHIPPING ON ORDERS OVER $500",
  "SAME DAY SHIPPING",
  "100% AUTHENTIC GUARANTEED",
  "BUY NOW PAY LATER AVAILABLE",
  "LOCAL SAME DAY DELIVERY!",
];

export default function AnnouncementBar() {
  const text = MESSAGES.join("   |   ");

  return (
    <div className="overflow-hidden bg-black py-2 text-white">
      <div className="animate-marquee whitespace-nowrap text-center text-[11px] font-medium uppercase tracking-wide">
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
}
