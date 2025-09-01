import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, Navbar, HeroSectionComponent, ProductGridComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage implements OnInit {
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  bestSellers: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  async loadProducts(): Promise<void> {
    try {
      const allProducts = await firstValueFrom(this.productService.getProducts());
      
   
      this.featuredProducts = allProducts.slice(0, 4);
      this.featuredProducts = allProducts.slice(0, 4);
      this.newArrivals = allProducts.slice(4, 8);
      this.bestSellers = allProducts.slice(8, 12);
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading products:', error);
      this.loading = false;
    }
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    // Show toast notification here
  }

  onQuickView(product: Product): void {
    // Implement quick view modal
    console.log('Quick view:', product);
  }

  onToggleWishlist(product: Product): void {
    // Implement wishlist functionality
    console.log('Toggle wishlist:', product);
  }

  onViewAllProducts(): void {
    this.router.navigate(['/products']);
  }
}
