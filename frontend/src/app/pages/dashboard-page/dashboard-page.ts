import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { AdminProductCardComponent } from '../../components/admin-product-card/admin-product-card.component';
import { PopupDialogComponent } from '../../components/popup-dialog/popup-dialog.component';
import { Product } from '../../models/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminProductCardComponent, PopupDialogComponent],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css']
})
export class DashboardPage implements OnInit {
  activeTab = signal('overview');
  products = signal<Product[]>([]);
  orders = signal<any[]>([]);
  users = signal<any[]>([]);
  loading = signal(false);
  
  totalRevenue = signal(0);
  totalOrders = signal(0);
  totalProducts = signal(0);
  totalCustomers = signal(0);

  // Product dialog state
  showProductDialog = false;
  selectedProduct: Product | null = null;

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      // Load all data
      const [products, orders, users] = await Promise.all([
        firstValueFrom(this.productService.getProducts()),
        firstValueFrom(this.orderService.getAllOrders()),
        firstValueFrom(this.userService.getAllUsers())
      ]);

      this.products.set(products || []);
      this.products.set(products || []);
      this.orders.set(orders || []);
      this.users.set(users || []);

      // Calculate stats
      this.totalProducts.set(products?.length || 0);
      this.totalOrders.set(orders?.length || 0);
      this.totalCustomers.set(users?.filter(u => u.userType === 1).length || 0);
      this.totalRevenue.set(orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.authService.logout();
  }

  // Product dialog methods
  openProductDialog(product?: Product): void {
    this.selectedProduct = product || null;
    this.showProductDialog = true;
  }

  onCloseProductDialog(): void {
    this.showProductDialog = false;
    this.selectedProduct = null;
  }

  onProductSaved(product: Product): void {
    if (this.selectedProduct) {
      // Update existing product in the list
      this.products.update(products => 
        products.map(p => p.id === product.id ? product : p)
      );
    } else {
      // Add new product to the list
      this.products.update(products => [...products, product]);
      this.totalProducts.update(count => count + 1);
    }
  }

  onEditProduct(product: Product): void {
    this.openProductDialog(product);
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.prodName}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products.update(products => products.filter(p => p.id !== product.id));
          this.totalProducts.update(count => count - 1);
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  onViewOrder(order: any): void {
    // Navigate to order details
    console.log('View order:', order);
  }

  onUpdateOrderStatus(order: any, status: string): void {
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.orders.update(orders => 
          orders.map(o => o.id === order.id ? { ...o, status } : o)
        );
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  onViewUser(user: any): void {
    // Navigate to user details
    console.log('View user:', user);
  }

  onDeleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete user "${user.userId}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== user.id));
          if (user.userType === 1) {
            this.totalCustomers.update(count => count - 1);
          }
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  getOrderStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  }

  getUserTypeText(userType: number): string {
    return userType === 0 ? 'Admin' : 'Customer';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
