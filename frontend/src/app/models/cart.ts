export interface Cart {
  id: number;
  userId: number;
  products: { productId: number; quantity: number }[];
  totalPrice: number;
}
