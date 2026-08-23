import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCategories } from "@/lib/api/categories";
import { getAnnouncements } from "@/lib/api/announcements";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HYP - A Futuristic Sneaker & Streetwear Shopping Experience",
  description:
    "Shop sneakers, apparel and accessories from Jordan, Nike, Chrome Hearts, Rhude and more at HYP.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Header/AnnouncementBar apply to every route, not just the home page, so
  // this fetch lives in the root layout rather than app/page.tsx.
  const [categories, announcements] = await Promise.all([getCategories(), getAnnouncements()]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header categories={categories} announcements={announcements} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
