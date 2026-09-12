import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

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
          <Image src="/brand/bazynlocirc.png" alt="Banzylo" width={64} height={64} className="h-14 w-14" />
          <div className="mt-5 flex gap-4">
            <a href="https://instagram.com/hypmiami" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon />
            </a>
          </div>
        </div>

        {/* Banzylo é 100% online, sem loja física — nada de endereço/horário
            por unidade, só a cidade-base e os canais de apoio ao cliente.
            Número/horário são placeholder de desenvolvimento — trocar pelos
            reais antes de produção. */}
        <div className="text-sm text-white/70">
          <p className="font-semibold text-white">Luanda, Angola</p>
          <p className="mt-1">Loja 100% online</p>

          <a href="mailto:customerservice@banzylo.com" className="mt-4 block hover:text-white">
            customerservice@banzylo.com
          </a>
          <a
            href="https://wa.me/244923456789"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 hover:text-white"
          >
            <WhatsAppIcon />
            +244 923 456 789
          </a>
          <p className="mt-3 text-xs text-white/50">Apoio ao cliente: Seg–Sáb, 9h–18h (WAT)</p>
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
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40 sm:px-6">
        © {new Date().getFullYear()} Banzylo. All rights reserved.
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

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.83 9.83 0 0 0 4.62 1.15h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.13.11-1.82-.11a16.4 16.4 0 0 1-1.66-.61c-2.92-1.26-4.83-4.2-4.97-4.4-.14-.19-1.2-1.59-1.2-3.04 0-1.44.76-2.15 1.03-2.45.27-.29.6-.36.8-.36.2 0 .4 0 .57.01.19.01.43-.07.67.51.24.59.83 2.03.9 2.18.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.14.46.12.63-.07.17-.19.72-.83.92-1.12.19-.28.38-.23.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
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
