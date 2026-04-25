import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantDto, MenuCategoryDto, MenuItemDto, ReviewDto } from '../../../core/models/restaurant.models';

interface CartItem { item: MenuItemDto; qty: number; }

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div *ngIf="loading" class="loading-screen"><div class="spinner-wrap">🍽️ Loading restaurant...</div></div>
    <div *ngIf="!restaurant && !loading" class="not-found">
      <div class="nf-icon">🍽️</div><h2>Restaurant not found</h2>
      <a routerLink="/restaurants" class="btn-back-home">← Back to restaurants</a>
    </div>

    <div *ngIf="restaurant && !loading" class="detail-page">
      <div class="hero-banner" [style.backgroundImage]="restaurant.logoUrl ? 'url(' + restaurant.logoUrl + ')' : 'none'">
        <div class="hero-overlay">
          <div class="hero-inner">
            <a routerLink="/restaurants" class="back-btn">← Back</a>
            <div class="hero-content">
              <div class="restaurant-logo" *ngIf="restaurant.logoUrl"><img [src]="restaurant.logoUrl" [alt]="restaurant.name" /></div>
              <div class="restaurant-logo placeholder" *ngIf="!restaurant.logoUrl">🍽️</div>
              <div class="hero-text">
                <h1>{{ restaurant.name }}</h1>
                <p class="cuisine-tag">🍴 {{ restaurant.cuisineTypes }}</p>
                <p class="description">{{ restaurant.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-bar">
        <div class="info-bar-inner">
          <div class="info-chip"><span class="chip-icon">⭐</span><div><span class="chip-val">{{ restaurant.averageRating | number:'1.1-1' }}</span><span class="chip-lbl">{{ restaurant.totalReviews }} reviews</span></div></div>
          <div class="info-divider"></div>
          <div class="info-chip"><span class="chip-icon">🕐</span><div><span class="chip-val">{{ restaurant.estimatedDeliveryMinutes }} min</span><span class="chip-lbl">Delivery time</span></div></div>
          <div class="info-divider"></div>
          <div class="info-chip"><span class="chip-icon">₹</span><div><span class="chip-val">₹{{ restaurant.minimumOrderAmount }}</span><span class="chip-lbl">Min order</span></div></div>
          <div class="info-divider"></div>
          <div class="info-chip"><span class="chip-icon">📍</span><div><span class="chip-val address">{{ restaurant.address }}</span><span class="chip-lbl">Address</span></div></div>
          <div class="info-divider"></div>
          <div class="status-pill" [class.open]="restaurant.isOpen" [class.closed]="!restaurant.isOpen">
            <span class="dot"></span>{{ restaurant.isOpen ? 'Open Now' : 'Closed' }}
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="menu-col">
          <div *ngIf="menu.length === 0" class="empty-menu"><div class="em-icon">🍽️</div><p>Menu not available yet.</p></div>

          <div *ngFor="let cat of menu" class="category-section">
            <div class="category-title"><span>{{ cat.name }}</span><span class="item-count">{{ cat.items.length }} items</span></div>
            <div class="items-grid">
              <div *ngFor="let item of cat.items" class="item-card" [class.unavailable]="!item.isAvailable">
                <div class="item-img-wrap">
                  <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name" class="item-img" />
                  <div *ngIf="!item.imageUrl" class="item-img-placeholder">🍽️</div>
                  <div *ngIf="!item.isAvailable" class="unavail-badge">Unavailable</div>
                </div>
                <div class="item-body">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-desc" *ngIf="item.description">{{ item.description }}</div>
                  <div class="item-tags" *ngIf="item.dietaryTags">
                    <span *ngFor="let tag of item.dietaryTags.split(',')" class="tag">{{ tag.trim() }}</span>
                  </div>
                  <div class="item-footer">
                    <span class="item-price">₹{{ item.price }}</span>
                    <button class="btn-add" (click)="addToCart(item)" [disabled]="!item.isAvailable">
                      <span *ngIf="!inCart(item)">+ Add</span>
                      <span *ngIf="inCart(item)">{{ getQty(item) }} in cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="reviews-section">
            <h3>⭐ Customer Reviews <span class="review-count">({{ reviews.length }})</span></h3>
            <div *ngFor="let r of reviews" class="review-card">
              <div class="review-top">
                <div class="reviewer-avatar">{{ r.customerName.charAt(0) }}</div>
                <div class="reviewer-info"><span class="reviewer-name">{{ r.customerName }}</span><span class="review-date">{{ r.createdAt | date:'mediumDate' }}</span></div>
                <div class="stars"><span *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= r.rating">★</span></div>
              </div>
              <p class="review-text" *ngIf="r.reviewText">{{ r.reviewText }}</p>
              <div class="owner-reply" *ngIf="r.ownerResponse"><span class="reply-label">🏪 Owner replied:</span> {{ r.ownerResponse }}</div>
            </div>
            <div *ngIf="reviews.length === 0" class="no-reviews">No reviews yet — be the first!</div>
          </div>
        </div>

        <div class="cart-col">
          <div class="cart-panel">
            <div class="cart-header">
              <h3>🛒 Your Order</h3>
              <span class="cart-badge" *ngIf="cart.length > 0">{{ totalItems }}</span>
            </div>
            <div *ngIf="cart.length === 0" class="cart-empty"><div class="ce-icon">🛒</div><p>Add items from the menu to start your order</p></div>
            <div *ngIf="cart.length > 0">
              <div *ngFor="let c of cart" class="cart-row">
                <div class="cart-item-info"><span class="cart-item-name">{{ c.item.name }}</span><span class="cart-item-price">₹{{ c.item.price * c.qty }}</span></div>
                <div class="qty-ctrl">
                  <button (click)="dec(c)">−</button><span>{{ c.qty }}</span><button (click)="inc(c)">+</button>
                </div>
              </div>
              <div class="cart-summary">
                <div class="summary-row"><span>Subtotal</span><span>₹{{ total }}</span></div>
                <div class="summary-row muted"><span>Delivery fee</span><span>Free</span></div>
                <div class="summary-total"><span>Total</span><span>₹{{ total }}</span></div>
              </div>
              <div class="addr-section">
                <label>📍 Delivery Address</label>
                <textarea [(ngModel)]="deliveryAddress" rows="2" placeholder="Enter your full delivery address..."></textarea>
              </div>
              <div class="error-msg" *ngIf="orderError">{{ orderError }}</div>
              <button class="btn-place-order" (click)="placeOrder()" [disabled]="placing || !deliveryAddress.trim()">
                <span *ngIf="!placing">Place Order · ₹{{ total }}</span>
                <span *ngIf="placing">Placing order...</span>
              </button>
              <button class="btn-clear" (click)="cart = []">Clear cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './restaurant-detail.scss'
})
export class RestaurantDetailComponent implements OnInit {
  restaurant?: RestaurantDto;
  menu: MenuCategoryDto[] = [];
  reviews: ReviewDto[] = [];
  cart: CartItem[] = [];
  deliveryAddress = '';
  placing = false;
  orderError = '';
  loading = true;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private svc: RestaurantService, private orderSvc: OrderService, private auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({ next: r => { this.restaurant = r; this.loading = false; }, error: () => this.loading = false });
    this.svc.getMenu(id).subscribe({ next: m => this.menu = m, error: () => {} });
    this.svc.getReviews(id).subscribe({ next: r => this.reviews = r, error: () => {} });
  }

  addToCart(item: MenuItemDto) {
    if (!item.isAvailable) return;
    const existing = this.cart.find(c => c.item.id === item.id);
    if (existing) existing.qty++; else this.cart.push({ item, qty: 1 });
  }
  inc(c: CartItem) { c.qty++; }
  dec(c: CartItem) { c.qty > 1 ? c.qty-- : this.cart.splice(this.cart.indexOf(c), 1); }
  inCart(item: MenuItemDto) { return this.cart.some(c => c.item.id === item.id); }
  getQty(item: MenuItemDto) { return this.cart.find(c => c.item.id === item.id)?.qty ?? 0; }
  get total() { return this.cart.reduce((s, c) => s + c.item.price * c.qty, 0); }
  get totalItems() { return this.cart.reduce((s, c) => s + c.qty, 0); }

  placeOrder() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.deliveryAddress.trim()) { this.orderError = 'Please enter a delivery address'; return; }
    this.placing = true; this.orderError = '';
    this.orderSvc.place({
      restaurantId: this.restaurant!.id,
      deliveryAddress: this.deliveryAddress,
      paymentMethod: 0,
      items: this.cart.map(c => ({ menuItemId: c.item.id, menuItemName: c.item.name, quantity: c.qty, unitPrice: c.item.price }))
    }).subscribe({
      next: (order) => this.router.navigate(['/orders', order.id]),
      error: (err) => { this.orderError = err.error?.message || err.error || 'Failed to place order'; this.placing = false; }
    });
  }
}
