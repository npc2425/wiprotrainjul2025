import { Component } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar.component';
import { filter } from 'rxjs';
import { CustomerProductCardComponent } from "./components/product-card/product-card.component";

import { CommonModule } from '@angular/common';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  standalone: true,
  imports: [RouterOutlet, Navbar, CustomerProductCardComponent, CommonModule],
})
export class App {
  showNavbar = true;
  product: any; 

  constructor(
    private router: Router,
    public productService: ProductService
  ) {
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = ['/login', '/register'];
        this.showNavbar = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
  }

  isAdmin(): boolean {
    // Implement your admin check logic here
    return false; // Example return value
  }

  addToCart(product: any): void {
    this.productService.addToCart(product);
  }

  toggleWishlist(product: any): void {
    this.productService.toggleWishlist(product);
  }

  quickView(product: any): void {
    // Implement your quick view logic here
  }

  viewProduct(product: any): void {
    this.router.navigate(['/product-details', product.id]);
  }
}
