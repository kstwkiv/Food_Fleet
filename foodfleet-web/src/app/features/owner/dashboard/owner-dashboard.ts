import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { RestaurantDto } from '../../../core/models/restaurant.models';
import { OrderDto } from '../../../core/models/order.models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🏪 My Restaurants</h2>
        <a routerLink="/owner/create-restaurant" class="btn-add">+ Add Restaurant</a>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="icon">⏳</div><p>Loading your restaurants...</p>
      </div>

      <!-- Restaurant cards -->
      <div class="restaurants-grid" *ngIf="!loading && restaurants.length > 0">
        <div *ngFor="let r of restaurants" class="restaurant-card"
          [class.selected]="selected?.id === r.id"
          (click)="select(r)">
          <div class="card-logo" *ngIf="r.logoUrl"><img [src]="r.logoUrl" [alt]="r.name" /></div>
          <div class="card-logo placeholder" *ngIf="!r.logoUrl">🍽️</div>
          <div class="card-body">
            <div class="card-name">{{ r.name }}</div>
            <div class="card-cuisine">{{ r.cuisineTypes }}</div>
            <div class="card-meta">
              <span class="status-badge" [class]="r.status.toLowerCase()">{{ r.status }}</span>
              <span class="open-badge" *ngIf="r.status === 'Active'" [class.open]="r.isOpen" [class.closed]="!r.isOpen">
                {{ r.isOpen ? '● Open' : '● Closed' }}
              </span>
            </div>
          </div>
          <div class="card-actions" (click)="$event.stopPropagation()">
            <a [routerLink]="['/owner/menu', r.id]" class="btn-menu">🍽️ Menu</a>
            <button *ngIf="r.status === 'Active'" class="btn-toggle" (click)="toggleOpen(r)">
              {{ r.isOpen ? 'Close' : 'Open' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && restaurants.length === 0" class="no-restaurant">
        <div class="icon">🏪</div>
        <p>You haven't registered any restaurants yet.</p>
        <a routerLink="/owner/create-restaurant" class="btn-create">Register Your First Restaurant</a>
      </div>

      <!-- Selected restaurant detail -->
      <div *ngIf="selected" class="selected-detail">
        <div class="detail-header">
          <h3>{{ selected.name }}</h3>
          <div class="detail-meta">
            <span>📍 {{ selected.address }}</span>
            <span>⭐ {{ selected.averageRating | number:'1.1-1' }} ({{ selected.totalReviews }} reviews)</span>
            <span>🕐 {{ selected.estimatedDeliveryMinutes }} min</span>
          </div>
        </div>

        <div *ngIf="selected.status === 'Pending'" class="notice pending-notice">
          ⏳ Under review — an admin will approve it shortly.
        </div>
        <div *ngIf="selected.status === 'Rejected'" class="notice rejected-notice">
          ❌ Rejected. Please contact support or register a new restaurant.
        </div>

        <!-- Orders for selected restaurant -->
        <div class="orders-section" *ngIf="selected.status === 'Active'">
          <h4>📋 Incoming Orders</h4>
          <div *ngIf="ordersLoading" class="orders-loading">Loading orders...</div>
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
          <div *ngIf="!ordersLoading && orders.length === 0" class="empty">No orders yet.</div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './owner-dashboard.scss'
})
export class OwnerDashboardComponent implements OnInit {
  restaurants: RestaurantDto[] = [];
  selected?: RestaurantDto;
  orders: OrderDto[] = [];
  loading = true;
  ordersLoading = false;

  private readonly statusMap: Record<number, string> = {
    0: 'Placed', 1: 'Confirmed', 2: 'Preparing', 3: 'Ready', 4: 'Delivered', 5: 'Cancelled'
  };

  constructor(
    private restaurantSvc: RestaurantService,
    private orderSvc: OrderService
  ) {}

  ngOnInit() {
    this.restaurantSvc.getMyRestaurant().subscribe({
      next: list => {
        this.restaurants = list;
        this.loading = false;
        if (list.length === 1) this.select(list[0]);
      },
      error: () => this.loading = false
    });
  }

  select(r: RestaurantDto) {
    this.selected = r;
    this.orders = [];
    if (r.status === 'Active') {
      this.ordersLoading = true;
      this.orderSvc.getByRestaurant(r.id).subscribe({
        next: o => { this.orders = o; this.ordersLoading = false; },
        error: () => this.ordersLoading = false
      });
    }
  }

  toggleOpen(r: RestaurantDto) {
    this.restaurantSvc.toggleAvailability(r.id).subscribe(res => {
      r.isOpen = res.isOpen;
      if (this.selected?.id === r.id) this.selected = { ...this.selected, isOpen: res.isOpen };
    });
  }

  getStatus(order: OrderDto): string {
    const s = order.status as unknown;
    return typeof s === 'number' ? (this.statusMap[s] ?? String(s)) : String(s);
  }

  updateStatus(order: OrderDto, status: number) {
    this.orderSvc.updateStatus(order.id, status).subscribe(() => {
      const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      order.status = statuses[status] as any;
    });
  }
}
