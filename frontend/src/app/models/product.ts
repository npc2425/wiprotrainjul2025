export interface Product {
  id: number;
  prodName: string;
  prodDesc: string;
  prodCat: string;
  availableQty: number;
  price: number;
  imageURL?: string;
  prodRating?: number;
}
export interface CartItem {
  product: Product;
  quantity: number;
}
