import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar.component';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';


@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './product-details-page.html',
  styleUrls: ['./product-details-page.css']
})
export class ProductDetailsPage implements OnInit {
  product: Product | null = null;
  loading = true;
  quantity = 1;
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,

  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product ?? null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  addToCart(): void {
    if (this.product) {
      this.productService.addToCart(this.product, this.quantity);
      // Show success message or redirect to cart
    }
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity >= 1 && this.product && newQuantity <= this.product.availableQty) {
      this.quantity = newQuantity;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  getStockClass(): string {
    if (!this.product) return '';
    const qty = this.product.availableQty;
    if (qty === 0) return 'out-of-stock';
    if (qty < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockText(): string {
    if (!this.product) return '';
    const qty = this.product.availableQty;
    if (qty === 0) return 'Out of Stock';
    if (qty < 10) return `Only ${qty} left`;
    return 'In Stock';
  }
}
