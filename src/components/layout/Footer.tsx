import Image from "next/image";
import { LOCATIONS } from "@/data/locations";

// Quick Links and social profiles extracted verbatim from the real hypmiami.com footer.
const QUICK_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "New Releases", href: "/collections/sneakers" },
  { label: "Return Policy", href: "/policies/refund-policy" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Authenticity Policy", href: "/pages/authenticity-policy" },
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image src="/brand/hyp-logo.png" alt="HYP" width={90} height={72} className="h-14 w-auto" />
          <div className="mt-5 flex gap-4">
            <a href="https://instagram.com/hypmiami" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon />
            </a>
          </div>
        </div>

        <div className="text-sm text-white/70">
          <p className="font-semibold text-white">Mary Brickell Village</p>
          {LOCATIONS[0].address.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="mt-1">{LOCATIONS[0].phone}</p>

          <p className="mt-4 font-semibold text-white">Miami World Center</p>
          {LOCATIONS[1].address.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="mt-1">{LOCATIONS[1].phone}</p>

          <a href="mailto:customerservice@hypmiami.com" className="mt-4 block hover:text-white">
            customerservice@hypmiami.com
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Stay in the loop!</h3>
          <p className="mt-2 text-sm text-white/70">
            Join our mailing list and receive a coupon for your purchase!
          </p>
          <form className="mt-4 flex">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 border border-white bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40 sm:px-6">
        © {new Date().getFullYear()} HYP. All rights reserved.
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 3c.4 2.2 2 3.7 4.2 3.9v2.7c-1.5 0-2.9-.5-4.2-1.4v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.8a2.6 2.6 0 1 0 1.8 2.5V3h2.7Z" />
    </svg>
  );
}
