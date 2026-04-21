import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantDto, MenuCategoryDto, MenuItemDto, ReviewDto } from '../../../core/models/restaurant.models';

interface CartItem { item: MenuItemDto; qty: number; }

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" *ngIf="restaurant">
      <div class="restaurant-hero">
        <h1>{{ restaurant.name }}</h1>
        <p class="desc">{{ restaurant.description }}</p>
        <div class="meta-chips">
          <span class="chip">📍 {{ restaurant.address }}</span>
          <span class="chip">🍴 {{ restaurant.cuisineTypes }}</span>
          <span class="chip">⭐ {{ restaurant.averageRating | number:'1.1-1' }} ({{ restaurant.totalReviews }} reviews)</span>
          <span class="chip">🕐 {{ restaurant.estimatedDeliveryMinutes }} min delivery</span>
          <span class="chip" [class.chip-open]="restaurant.isOpen" [class.chip-closed]="!restaurant.isOpen">
            {{ restaurant.isOpen ? '● Open Now' : '● Closed' }}
          </span>
        </div>
      </div>

      <div class="content">
        <div class="menu-section">
          <div *ngFor="let cat of menu" class="category">
            <h3>{{ cat.name }}</h3>
            <div class="items">
              <div *ngFor="let item of cat.items" class="item-card">
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-desc">{{ item.description }}</span>
                  <span class="item-price">₹{{ item.price }}</span>
                </div>
                <button class="btn-add" (click)="addToCart(item)">+ Add</button>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-panel" *ngIf="cart.length > 0">
          <div class="cart-header">
            <h3>Your Order</h3>
            <span class="cart-count">{{ cart.length }}</span>
          </div>
          <div *ngFor="let c of cart" class="cart-item">
            <span class="item-name-cart">{{ c.item.name }}</span>
            <div class="qty-ctrl">
              <button (click)="dec(c)">−</button>
              <span>{{ c.qty }}</span>
              <button (click)="inc(c)">+</button>
            </div>
            <span class="item-price-cart">₹{{ c.item.price * c.qty }}</span>
          </div>
          <div class="cart-total"><span>Total</span><span>₹{{ total }}</span></div>
          <input [(ngModel)]="deliveryAddress" placeholder="📍 Enter delivery address" class="addr-input" />
          <button class="btn-order" (click)="placeOrder()" [disabled]="placing">
            {{ placing ? 'Placing order...' : '🛒 Place Order' }}
          </button>
          <div class="error" *ngIf="orderError">{{ orderError }}</div>
        </div>
      </div>

      <div class="reviews-section">
        <h3>⭐ Customer Reviews</h3>
        <div *ngFor="let r of reviews" class="review-card">
          <div class="review-header">
            <span class="reviewer">{{ r.customerName }}</span>
            <span class="stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            <span class="date">{{ r.createdAt | date:'mediumDate' }}</span>
          </div>
          <p class="review-text">{{ r.reviewText }}</p>
          <div class="owner-response" *ngIf="r.ownerResponse">
            <strong>Owner reply:</strong> {{ r.ownerResponse }}
          </div>
        </div>
        <div *ngIf="reviews.length === 0" class="no-reviews">No reviews yet — be the first to order!</div>
      </div>
    </div>

    <div *ngIf="!restaurant && !loading" class="not-found">🍽️ Restaurant not found.</div>
    <div *ngIf="loading" class="loading">Loading restaurant...</div>
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
    private route: ActivatedRoute,
    private router: Router,
    private svc: RestaurantService,
    private orderSvc: OrderService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({ next: r => { this.restaurant = r; this.loading = false; }, error: () => this.loading = false });
    this.svc.getMenu(id).subscribe({ next: m => this.menu = m, error: () => {} });
    this.svc.getReviews(id).subscribe({ next: r => this.reviews = r, error: () => {} });
  }

  addToCart(item: MenuItemDto) {
    const existing = this.cart.find(c => c.item.id === item.id);
    if (existing) existing.qty++;
    else this.cart.push({ item, qty: 1 });
  }

  inc(c: CartItem) { c.qty++; }
  dec(c: CartItem) { c.qty > 1 ? c.qty-- : this.cart.splice(this.cart.indexOf(c), 1); }

  get total() { return this.cart.reduce((s, c) => s + c.item.price * c.qty, 0); }

  placeOrder() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.deliveryAddress) { this.orderError = 'Please enter a delivery address'; return; }
    this.placing = true;
    this.orderSvc.place({
      restaurantId: this.restaurant!.id,
      deliveryAddress: this.deliveryAddress,
      paymentMethod: 0,
      items: this.cart.map(c => ({ menuItemId: c.item.id, quantity: c.qty, unitPrice: c.item.price }))
    }).subscribe({
      next: (order) => this.router.navigate(['/orders', order.id]),
      error: (err) => { this.orderError = err.error || 'Failed to place order'; this.placing = false; }
    });
  }
}
