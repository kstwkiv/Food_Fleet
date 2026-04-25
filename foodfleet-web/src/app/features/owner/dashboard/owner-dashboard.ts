import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantDto } from '../../../core/models/restaurant.models';
import { OrderDto } from '../../../core/models/order.models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🏪 Restaurant Dashboard</h2>
      </div>

      <div *ngIf="restaurant" class="restaurant-card">
        <div class="restaurant-header">
          <div>
            <h3>{{ restaurant.name }}</h3>
            <p>📍 {{ restaurant.address }}</p>
          </div>
          <div class="controls">
            <span class="status-badge" [class]="restaurant.status.toLowerCase()">{{ restaurant.status }}</span>
            <a [routerLink]="['/owner/menu', restaurant.id]" class="btn-menu">🍽️ Manage Menu</a>
            <button class="btn-toggle" (click)="toggleOpen()" *ngIf="restaurant.status === 'Active'">
              {{ restaurant.isOpen ? '🔴 Close Restaurant' : '🟢 Open Restaurant' }}
            </button>
          </div>
        </div>
        <div class="restaurant-stats">
          <div class="stat"><div class="stat-val">⭐ {{ restaurant.averageRating | number:'1.1-1' }}</div><div class="stat-lbl">Rating</div></div>
          <div class="stat"><div class="stat-val">{{ restaurant.totalReviews }}</div><div class="stat-lbl">Reviews</div></div>
          <div class="stat"><div class="stat-val">{{ restaurant.estimatedDeliveryMinutes }}m</div><div class="stat-lbl">Delivery Time</div></div>
        </div>
      </div>

      <div *ngIf="restaurant?.status === 'Pending'" class="pending-notice">
        ⏳ Your restaurant is under review. An admin will approve it shortly. You'll receive an email once it's live.
      </div>
      <div *ngIf="restaurant?.status === 'Rejected'" class="rejected-notice">
        ❌ Your restaurant was rejected. Please contact support or register a new one.
      </div>

      <div *ngIf="!restaurant && !loading" class="no-restaurant">
        <div class="icon">🏪</div>
        <p>You haven't registered a restaurant yet.</p>
        <a routerLink="/owner/create-restaurant" class="btn-create">Register Restaurant</a>
      </div>

      <div class="orders-section" *ngIf="restaurant?.status === 'Active'">
        <h3>📋 Incoming Orders</h3>
        <div *ngFor="let o of orders" class="order-row">
          <span class="order-id">#{{ o.id | slice:0:8 }}</span>
          <span>{{ o.items.length }} item(s)</span>
          <span class="amount">₹{{ o.totalAmount }}</span>
          <span class="status-badge" [class]="getStatus(o).toLowerCase()">{{ getStatus(o) }}</span>
          <div class="order-actions">
            <button *ngIf="getStatus(o) === 'Placed'" (click)="updateStatus(o, 1)" class="btn-sm green">✓ Confirm</button>
            <button *ngIf="getStatus(o) === 'Confirmed'" (click)="updateStatus(o, 2)" class="btn-sm orange">🍳 Preparing</button>
            <button *ngIf="getStatus(o) === 'Preparing'" (click)="updateStatus(o, 3)" class="btn-sm blue">📦 Ready</button>
          </div>
        </div>
        <div *ngIf="orders.length === 0" class="empty">No orders yet — your restaurant is live!</div>
      </div>
    </div>
  `,
  styleUrl: './owner-dashboard.scss'
})
export class OwnerDashboardComponent implements OnInit {
  restaurant?: RestaurantDto;
  orders: OrderDto[] = [];
  loading = true;

  private readonly statusMap: Record<number, string> = {
    0: 'Placed', 1: 'Confirmed', 2: 'Preparing', 3: 'Ready', 4: 'Delivered', 5: 'Cancelled'
  };

  constructor(
    private restaurantSvc: RestaurantService,
    private orderSvc: OrderService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.restaurantSvc.getMyRestaurant().subscribe({
      next: r => {
        this.restaurant = r;
        this.loading = false;
        if (r.status === 'Active') {
          this.orderSvc.getByRestaurant(r.id).subscribe(o => this.orders = o);
        }
      },
      error: () => { this.restaurant = undefined; this.loading = false; }
    });
  }

  getStatus(order: OrderDto): string {
    const s = order.status as unknown;
    return typeof s === 'number' ? (this.statusMap[s] ?? String(s)) : String(s);
  }

  toggleOpen() {
    if (!this.restaurant) return;
    this.restaurantSvc.toggleAvailability(this.restaurant.id).subscribe(res => {
      this.restaurant = { ...this.restaurant!, isOpen: res.isOpen };
    });
  }

  updateStatus(order: OrderDto, status: number) {
    this.orderSvc.updateStatus(order.id, status).subscribe(() => {
      const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      order.status = statuses[status] as any;
    });
  }
}
