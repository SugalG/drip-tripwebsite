export interface FlavorObj {
  id: string;
  name: string;
}

export interface OhmObj {
  id: string;
  value: string;
}

export interface ColorObj {
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
  isVisible: boolean;
  flavors: FlavorObj[];
  ohms: OhmObj[];
  colors: ColorObj[];
}
