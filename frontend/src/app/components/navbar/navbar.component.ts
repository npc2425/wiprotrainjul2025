import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class Navbar implements OnInit {
  searchQuery = signal('');
  showProfileMenu = signal(false);
  showMobileMenu = signal(false);
  showSearchResults = signal(false);
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  cartCount = signal(0);
  
  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartCount.set(this.cartService.getCartCount());
    });

    // Setup search with debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          this.showSearchResults.set(false);
          return of([]);
        }
        this.isSearching.set(true);
        return this.productService.searchProducts(query);
      })
    ).subscribe(results => {
      this.searchResults.set(results);
      this.showSearchResults.set(results.length > 0);
      this.isSearching.set(false);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container') && !target.closest('.profile-section')) {
      this.showSearchResults.set(false);
      this.showProfileMenu.set(false);
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onSearchSubmit(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.showSearchResults.set(false);
      this.router.navigate(['/search'], { 
        queryParams: { q: query }
      });
    }
  }

  onSearchResultClick(product: Product): void {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    this.router.navigate(['/product-details', product.id]);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(show => !show);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(show => !show);
  }

  toggleCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.showProfileMenu.set(false);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  currentUser() {
    return this.authService.currentUser();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.userId?.[0]?.toUpperCase() || 'U';
  }
}
