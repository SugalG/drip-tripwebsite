export interface FlavorObj {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string[];
  coverIndex: number;
  flavors: FlavorObj[];
}