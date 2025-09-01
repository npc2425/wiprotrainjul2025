import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar.component';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/product.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;
    this.orderService.getOrderById(userId).subscribe({
      next: (orders) => {
        this.orders = Array.isArray(orders) ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : (orders ? [orders] : []);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'placed':
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
