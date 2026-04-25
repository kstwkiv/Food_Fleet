import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderDto } from '../../../core/models/order.models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🧾 My Orders</h2>
        <a routerLink="/restaurants" class="btn-browse">+ New Order</a>
      </div>

      <div *ngIf="loading" class="loading-state"><div class="icon">⏳</div><p>Loading your orders...</p></div>

      <div *ngIf="error" class="error-state">
        <div class="icon">⚠️</div><p>{{ error }}</p>
        <button (click)="load()">Try again</button>
      </div>

      <div *ngIf="!loading && !error">
        <div *ngIf="orders.length === 0" class="empty-state">
          <div class="icon">🛒</div>
          <p>You haven't placed any orders yet.</p>
          <a routerLink="/restaurants" class="btn-browse">Browse restaurants</a>
        </div>

        <div class="orders-list" *ngIf="orders.length > 0">
          <a *ngFor="let o of orders" [routerLink]="['/orders', o.id]" class="order-card">
            <div class="order-left">
              <div class="order-id">#{{ o.id | slice:0:8 }}...</div>
              <div class="order-date">{{ o.createdAt | date:'mediumDate' }}</div>
              <div class="order-items">
                {{ o.items.length }} item{{ o.items.length !== 1 ? 's' : '' }}
                <span class="item-names">— {{ o.items.slice(0,2).map(i => i.menuItemName).join(', ') }}{{ o.items.length > 2 ? '...' : '' }}</span>
              </div>
            </div>
            <div class="order-right">
              <div class="order-amount">₹{{ o.totalAmount }}</div>
              <span class="status-badge" [class]="getStatus(o).toLowerCase()">{{ getStatus(o) }}</span>
              <span class="view-link">View →</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrl: './order-history.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = true;
  error = '';

  private readonly statusMap: Record<number, string> = {
    0: 'Placed', 1: 'Confirmed', 2: 'Preparing', 3: 'Ready', 4: 'Delivered', 5: 'Cancelled', 6: 'Rejected'
  };

  constructor(private orderSvc: OrderService, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    const userId = this.auth.currentUser()?.id!;
    this.orderSvc.getHistory(userId).subscribe({
      next: o => { this.orders = o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); this.loading = false; },
      error: () => { this.error = 'Could not load orders. Make sure the server is running.'; this.loading = false; }
    });
  }

  getStatus(order: OrderDto): string {
    const s = order.status as unknown;
    return typeof s === 'number' ? (this.statusMap[s] ?? String(s)) : String(s);
  }
}
