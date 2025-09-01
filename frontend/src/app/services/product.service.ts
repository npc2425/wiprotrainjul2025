// src/app/services/product.service.ts

import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Product, CartItem } from '../models/product';
import { catchError, Observable, of, tap } from 'rxjs';

// --- Placeholder Services (replace with your actual implementations) ---
// You would have a real authentication service to get the logged-in user's ID.
@Injectable({ providedIn: 'root' })
export class AuthService {
  getCurrentUserId(): number | null {
    const user = localStorage.getItem('user_data');
    return  JSON.parse(user!).id
  }
}


@Injectable({ providedIn: 'root' })
export class NotificationService {
  showError(message: string): void {
    console.error('NOTIFICATION:', message);
  }
}


@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // API Endpoints
  private productApiUrl = 'http://localhost:8082/product';
  private cartApiUrl = 'http://localhost:8083/cart';

  private wishlistApiUrl = 'http://localhost:8082/wishlist'; 

  products = signal<Product[]>([]);
  cartItems = signal<CartItem[]>([]);
  wishlistItems = signal<Product[]>([]);
  

  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() => this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
  wishlistCount = computed(() => this.wishlistItems().length);

  constructor() {
    this.loadInitialData();
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productApiUrl}/search?query=${encodeURIComponent(query)}`).pipe(
      catchError((error: HttpErrorResponse) => {    
        this.notificationService.showError('Search failed. Please try again.');
        return of([]);
      }
      )
    );
  }

  private loadInitialData(): void {
    const userId = this.authService.getCurrentUserId();
    
    this.http.get<Product[]>(this.productApiUrl).subscribe(data => this.products.set(data));

    if (userId) {
      this.http.get<CartItem[]>(`${this.cartApiUrl}/${userId}`).subscribe(data => this.cartItems.set(data));      
      this.http.get<Product[]>(`${this.wishlistApiUrl}/${userId}`).subscribe(data => this.wishlistItems.set(data));
    }
  }


  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productApiUrl).pipe(
      tap(products => this.products.set(products))
    );
  }

  addToCart(product: Product, quantity: number = 1): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const previousCart = this.cartItems();
    const existingItem = previousCart.find(item => item.product.id === product.id);
    if (existingItem) {
      const updatedCart = previousCart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      this.cartItems.set(updatedCart);
    } else {
      this.cartItems.set([...previousCart, { product, quantity }]);
    }
    this.http.post<CartItem>(`${this.cartApiUrl}/${userId}/add`, { productId: product.id, quantity })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.cartItems.set(previousCart); 
          this.notificationService.showError('Failed to add item to cart. Please try again.');
          return of(null); 
        })
      ).subscribe();
  }
  
  removeFromCart(productId: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const previousCart = this.cartItems();
    this.cartItems.set(previousCart.filter(item => item.product.id !== productId));
    this.http.delete(`${this.cartApiUrl}/${userId}/delete/${productId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // 3. Revert on Error
          this.cartItems.set(previousCart);
          this.notificationService.showError('Failed to remove item from cart.');
          return of(null);
        })
      ).subscribe();
  }

 
  updateCartQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    
    const previousCart = this.cartItems();
    
    // 1. Optimistic Update
    const updatedCart = previousCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedCart);

    // 2. Backend Request
    this.http.put(`${this.cartApiUrl}/${userId}/update/${productId}?quantity=${quantity}`, {})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // 3. Revert on Error
          this.cartItems.set(previousCart);
          this.notificationService.showError('Failed to update cart quantity.');
          return of(null);
        })
      ).subscribe();
  }
  
  // --- Wishlist Management with Optimistic Updates ---

  /**
   * Toggles a product's presence in the wishlist with an optimistic update.
   */
  toggleWishlist(product: Product): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    
    const previousWishlist = this.wishlistItems();
    const isInWishlist = previousWishlist.some(p => p.id === product.id);

    // 1. Optimistic Update
    if (isInWishlist) {
      this.wishlistItems.set(previousWishlist.filter(p => p.id !== product.id));
    } else {
      this.wishlistItems.set([...previousWishlist, product]);
    }
    
    // 2. Backend Request
    const request = isInWishlist
      ? this.http.delete(`${this.wishlistApiUrl}/${userId}/remove/${product.id}`)
      : this.http.post(`${this.wishlistApiUrl}/${userId}/add`, { productId: product.id });
      
    request.pipe(
      catchError((error: HttpErrorResponse) => {
        // 3. Revert on Error
        this.wishlistItems.set(previousWishlist);
        this.notificationService.showError('Failed to update wishlist.');
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Checks if a product is in the user's wishlist.
   */
  isInWishlist(productId: number): boolean {
    return this.wishlistItems().some(item => item.id === productId);
  }
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productApiUrl}/${id}`);
  }
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.productApiUrl}/${id}`, product).pipe(tap(updatedProduct => {
      const updatedProducts = this.products().map(p => p.id === id ? updatedProduct : p);
      this.products.set(updatedProducts);
    }));
  }
  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.productApiUrl, product).pipe(tap(newProduct => {
      this.products.set([...this.products(), newProduct]);
    }));
  }
  
  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.productApiUrl}/${productId}`).pipe(tap(() => {
      this.products.set(this.products().filter(p => p.id !== productId)); 
    }));
  }
}
