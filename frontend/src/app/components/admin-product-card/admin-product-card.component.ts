import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-card.component.html',
  styleUrls: ['./admin-product-card.component.css']
})
export class AdminProductCardComponent {
  @Input() product!: Product;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
  constructor(private productService: ProductService) {}
  onEdit(): void {
    this.productService.updateProduct(this.product.id, this.product).subscribe(() => {
      console.log('Product updated successfully');
    } );
    this.edit.emit(this.product);
  }

  onDelete(): void {
    // remove from database
    this.productService.deleteProduct(this.product.id).subscribe(() => {
      console.log('Product deleted successfully');
    }
    );
    // emit event to parent to remove from UI
    this.delete.emit(this.product);
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
    if (qty < 10) return `Low Stock (${qty})`;
    return `In Stock (${qty})`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
