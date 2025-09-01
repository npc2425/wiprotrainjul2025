import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar.component';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/product.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './orders-details.component.html',
  styleUrls: ['./orders-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = false;
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = Number(params['id']);
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.router.navigate(['/orders']);
      }
    });
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        if (order) {
          this.order = order;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  goBackToOrders(): void {
    this.router.navigate(['/orders']);
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
      weekday: 'long',
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

  getSubtotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getShipping(): number {
    return this.getSubtotal() > 999 ? 0 : 99;
  }

  getTax(): number {
    return this.getSubtotal() * 0.18; // 18% GST
  }

  getItemTotal(item: any): number {
    return item.price * item.quantity;
  }

  cancelOrder(): void {
    if (!this.order || !this.orderId) return;
    
    if (this.order.status === 'delivered' || this.order.status === 'cancelled') {
      alert('This order cannot be cancelled.');
      return;
    }

    if (confirm('Are you sure you want to cancel this order?')) {
      // In a real app, you'd call the cancel order API
      alert('Order cancellation requested. You will receive a confirmation email shortly.');
    }
  }
}
