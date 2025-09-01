import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar.component';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product';
import { AuthService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './cart-page.html',
  styleUrls: ['./cart-page.css']
})
export class CartPageComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartItems = this.cartService.getCartItems();
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
    this.loadCartItems();
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.loadCartItems();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.loadCartItems();
  }

  getSubtotal(): number {
    return this.cartService.getCartTotal();
  }

  getShipping(): number {
    return this.getSubtotal() > 999 ? 0 : 99;
  }

  getTax(): number {
    return this.getSubtotal() * 0.18; // 18% GST
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    const userId = this.authService.getCurrentUserId();
    console.log('User ID:', userId); // Debugging line
    if (!userId) {
      alert('Error: You must be logged in to place an order.');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    this.orderService.createOrder(userId, this.cartItems).subscribe(order => {
      if (order) {
        alert('Success! Your order has been placed.');
        
        this.router.navigate(['/']); 
      } else {
        alert('Failure! There was an issue placing your order. Please try again.');
      }
    });
  }
  
}
