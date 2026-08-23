// Shape of GET /categories — recursive tree, top-level nodes have parentId: null.
export interface CategoryApi {
  id: string;
  name: string;
  slug: string;
  code: string;
  familyTag: string | null;
  bannerTitle: string | null;
  bannerDescription: string | null;
  parentId: string | null;
  children: CategoryApi[];
}
