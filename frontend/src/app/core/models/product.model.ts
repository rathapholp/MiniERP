export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  vatRate: number;
  stockQty: number;
  categoryId?: number;
  category?: Category;
}
