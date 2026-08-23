// Shape of GET /announcements?locale=pt (resolved single-locale response).
export interface AnnouncementApi {
  id: string;
  text: string;
  linkText: string | null;
  link: string | null;
  position: number;
}
