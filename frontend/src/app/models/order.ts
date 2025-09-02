import { OrderItem } from "./order-item";

export interface Order {
  orderId: number;
  userId: number;
  totalAmount: number;
  orderStatus: string;
  orderDate: string; // ISO date string format
  items: OrderItem[];
}
