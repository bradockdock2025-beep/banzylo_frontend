export type ProductCategory = "sneakers" | "apparel" | "accessories";

export interface Product {
  slug: string;
  title: string;
  brand: string;
  category: ProductCategory;
  price: number;
  images: string[];
}
