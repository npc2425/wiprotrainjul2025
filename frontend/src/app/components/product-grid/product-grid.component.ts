import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, CustomerProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Input() title: string = '';
  @Input() columns: number = 4;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();

  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }

  onQuickView(product: Product): void {
    this.quickView.emit(product);
  }

  onToggleWishlist(product: Product): void {
    this.toggleWishlist.emit(product);
  }

  getGridClass(): string {
    return `grid-cols-${this.columns}`;
  }
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
