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
        <a routerLink="/restaurants" class="browse-link">Browse restaurants →</a>
      </div>

      <div *ngIf="loading" class="loading-state">Loading your orders...</div>

      <div class="orders-list" *ngIf="!loading">
        <div *ngFor="let o of orders" class="order-row">
          <div class="order-info">
            <span class="order-id">#{{ o.id | slice:0:8 }}...</span>
            <span class="date">{{ o.createdAt | date:'mediumDate' }}</span>
          </div>
          <div class="order-meta">
            <div class="meta-item"><span class="meta-val">{{ o.items.length }}</span>items</div>
            <div class="meta-item"><span class="meta-val">₹{{ o.totalAmount }}</span>total</div>
          </div>
          <span class="status-badge" [class]="o.status.toLowerCase()">{{ o.status }}</span>
          <a [routerLink]="['/orders', o.id]" class="btn-view">View →</a>
        </div>

        <div *ngIf="orders.length === 0" class="empty-state">
          <div class="icon">🛒</div>
          <p>You haven't placed any orders yet.</p>
          <a routerLink="/restaurants">Browse restaurants</a>
        </div>
      </div>
    </div>
  `,
  styleUrl: './order-history.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = true;

  constructor(private orderSvc: OrderService, private auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.currentUser()?.id!;
    this.orderSvc.getHistory(userId).subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
