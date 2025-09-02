import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.css'],
})
export class PopupDialogComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<Product>();

  isEditMode = false;
  isSubmitting = false;

  formData = {
    prodName: '',
    prodDesc: '',
    prodCat: '',
    availableQty: 0,
    price: 0,
    imageURL: '',
    prodRating: 0,
  };

  constructor(private productService: ProductService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isVisible']) {
      this.setupForm();
    }
  }

  private setupForm(): void {
    if (this.product) {
      this.isEditMode = true;
      this.formData = {
        prodName: this.product.prodName || '',
        prodDesc: this.product.prodDesc || '',
        prodCat: this.product.prodCat || '',
        availableQty: this.product.availableQty || 0,
        price: this.product.price || 0,
        imageURL: this.product.imageURL || '',
        prodRating: this.product.prodRating || 0,
      };
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.formData = {
      prodName: '',
      prodDesc: '',
      prodCat: '',
      availableQty: 0,
      price: 0,
      imageURL: '',
      prodRating: 0,
    };
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      let savedProduct: Product;
      if (this.isEditMode && this.product) {

        const updatedProduct = { ...this.product, ...this.formData };
        console.log('Updating product:', updatedProduct);
        savedProduct = await firstValueFrom(
          this.productService.updateProduct(this.product.id, updatedProduct)
        );
        
      } else {
        // Create new product
        savedProduct = await firstValueFrom(
          this.productService.createProduct(this.formData as Omit<Product, 'id'>)
        );
      }

      this.productSaved.emit(savedProduct);
      this.onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // You can add toast notification here
    } finally {
      this.isSubmitting = false;
    }
  }
}
