import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem } from '../models/product';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8083/order';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        // Return mock data for demo
        return of([
          {
            id: 1,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            totalAmount: 2999,
            status: 'pending',
            createdAt: '2024-01-15T10:30:00Z',
            items: []
          },
          {
            id: 2,
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            totalAmount: 1599,
            status: 'shipped',
            createdAt: '2024-01-14T14:20:00Z',
            items: []
          }
        ]);
      })
    );
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching order:', error);
        return of(null);
      })
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => {
        console.error('Error updating order status:', error);
        return of({} as Order);
      })
    );
  }

  createOrder(userId: number, items: CartItem[]): Observable<Order | null> {
    const totalAmount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    const orderPayload = {
      userId,
      totalAmount,
      orderStatus: 'PLACED',
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };
    console.log('Order Payload:', orderPayload); // Debugging line
    return this.http.post<Order>(this.apiUrl, orderPayload).pipe(
      catchError(error => {
        console.error('Error creating order:', error);
        return of(null); 
      })
    );
  }
 
  }


