import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-customer-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class CustomerProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();

  constructor(private router: Router, private cartService: CartService) {}

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product, 1);
    this.addToCart.emit(this.product);
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    this.toggleWishlist.emit(this.product);
  }

  onProductClick(): void {
    this.router.navigate(['/product-details', this.product.id]);
  }

  getCurrentPrice(): string {
    return this.product.price.toFixed(2);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  getStockClass(): string {
    const qty = this.product.availableQty;
    if (qty === 0) return 'out-of-stock';
    if (qty < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockText(): string {
    const qty = this.product.availableQty;
    if (qty === 0) return 'Out of Stock';
    if (qty < 10) return `Only ${qty} left`;
    return 'In Stock';
  }
}
