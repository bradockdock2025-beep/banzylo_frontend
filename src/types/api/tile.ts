// Shape of GET /homepage/tiles?section=<...>.
export interface TileApi {
  id: string;
  section: string;
  title: string;
  href: string;
  imageSrc: string;
  mobileImageSrc: string | null;
  position: number;
  isActive: boolean;
  updatedAt: string;
}
