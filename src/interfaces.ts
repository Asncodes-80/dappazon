export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  cost: any;
  rating: number;
  stock: number;
}

export interface ProductCategory {
  electronics: Product[];
  clothing: Product[];
  toys: Product[];
}
