import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { AnnouncementApi } from "@/types/api/announcement";

export async function getAnnouncements(): Promise<AnnouncementApi[]> {
  try {
    return await apiFetch<AnnouncementApi[]>("/announcements?locale=pt", {
      revalidate: REVALIDATE.announcements,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getAnnouncements failed:", err);
    return [];
  }
}
