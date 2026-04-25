import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDto } from '../../../core/models/order.models';
import { DeliveryDto } from '../../../core/models/delivery.models';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="loading" class="loading-screen">Loading order...</div>

    <div *ngIf="!order && !loading" class="not-found">
      <p>Order not found or could not be loaded.</p>
      <a routerLink="/orders">← Back to orders</a>
    </div>

    <div *ngIf="order" class="page">
      <div class="page-header">
        <div>
          <a routerLink="/orders" class="back-link">← My Orders</a>
          <h2>Order #{{ order.id | slice:0:8 }}...</h2>
          <p class="order-date">Placed on {{ order.createdAt | date:'medium' }}</p>
        </div>
        <div class="header-right">
          <span class="status-badge" [class]="statusStr.toLowerCase()">{{ statusStr }}</span>
          <button class="btn-cancel"
            *ngIf="statusStr === 'Placed' || statusStr === 'Confirmed'"
            (click)="cancelOrder()" [disabled]="cancelling">
            {{ cancelling ? 'Cancelling...' : 'Cancel Order' }}
          </button>
        </div>
      </div>

      <div class="content-grid">
        <div class="left-col">
          <div class="card">
            <div class="card-title">🛒 Items Ordered</div>
            <div *ngFor="let item of order.items" class="order-item">
              <div class="item-details">
                <span class="item-name">{{ item.menuItemName }}</span>
                <span class="item-qty">× {{ item.quantity }}</span>
              </div>
              <span class="item-price">₹{{ item.unitPrice * item.quantity }}</span>
            </div>
            <div class="price-breakdown">
              <div class="price-row"><span>Subtotal</span><span>₹{{ subtotal }}</span></div>
              <div class="price-row muted"><span>Delivery fee</span><span>₹30</span></div>
              <div class="price-row muted"><span>Tax (5%)</span><span>₹{{ tax }}</span></div>
              <div class="price-row total"><span>Total</span><span>₹{{ order.totalAmount }}</span></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">📋 Order Details</div>
            <div class="detail-row"><span class="detail-label">Delivery Address</span><span class="detail-val">{{ order.deliveryAddress }}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-val">{{ order.paymentMethod }}</span></div>
          </div>

          <div class="card location-card" *ngIf="delivery?.currentLat && delivery?.currentLng">
            <div class="card-title">📍 Agent Location</div>
            <p class="location-text">{{ delivery!.currentLat | number:'1.4-4' }}, {{ delivery!.currentLng | number:'1.4-4' }}</p>
            <p class="location-hint">Location updates in real-time</p>
          </div>
        </div>

        <div class="right-col">
          <div class="card tracking-card">
            <div class="card-title">🚴 Order Tracking</div>
            <div class="tracking-steps">
              <div class="step" [class.done]="true" [class.active]="statusStr === 'Placed'">
                <div class="step-dot"><span>✓</span></div>
                <div class="step-line"></div>
                <div class="step-body"><div class="step-name">Order Placed</div><div class="step-time">{{ order.createdAt | date:'shortTime' }}</div></div>
              </div>
              <div class="step" [class.done]="isAtOrPast('Confirmed')" [class.active]="statusStr === 'Confirmed'">
                <div class="step-dot"><span>✓</span></div>
                <div class="step-line"></div>
                <div class="step-body"><div class="step-name">Confirmed</div><div class="step-sub">Restaurant accepted your order</div></div>
              </div>
              <div class="step" [class.done]="isAtOrPast('Preparing')" [class.active]="statusStr === 'Preparing'">
                <div class="step-dot"><span>🍳</span></div>
                <div class="step-line"></div>
                <div class="step-body"><div class="step-name">Preparing</div><div class="step-sub">Your food is being prepared</div></div>
              </div>
              <div class="step" [class.done]="isAtOrPast('Ready')" [class.active]="statusStr === 'Ready'">
                <div class="step-dot"><span>📦</span></div>
                <div class="step-line"></div>
                <div class="step-body"><div class="step-name">Ready for Pickup</div><div class="step-sub">Waiting for delivery agent</div></div>
              </div>
              <div class="step" [class.done]="statusStr === 'Delivered'" [class.active]="statusStr === 'Delivered'">
                <div class="step-dot"><span>🏠</span></div>
                <div class="step-body">
                  <div class="step-name">Delivered</div>
                  <div class="step-sub" *ngIf="delivery?.completedAt">{{ delivery!.completedAt | date:'shortTime' }}</div>
                </div>
              </div>
              <div class="step cancelled" *ngIf="statusStr === 'Cancelled'">
                <div class="step-dot cancelled"><span>✕</span></div>
                <div class="step-body"><div class="step-name">Cancelled</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './order-detail.scss'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order?: OrderDto;
  delivery?: DeliveryDto;
  loading = true;
  cancelling = false;
  private hub?: signalR.HubConnection;

  private readonly statusOrder = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
  private readonly statusMap: Record<number, string> = {
    0: 'Placed', 1: 'Confirmed', 2: 'Preparing', 3: 'Ready', 4: 'Delivered', 5: 'Cancelled', 6: 'Rejected'
  };

  constructor(
    private route: ActivatedRoute,
    private orderSvc: OrderService,
    private deliverySvc: DeliveryService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    if (!id) { this.loading = false; return; }
    this.orderSvc.getById(id).subscribe({
      next: o => { this.order = o; this.loading = false; this.loadDelivery(id); this.connectHub(id); },
      error: () => { this.loading = false; }
    });
  }

  get statusStr(): string {
    if (!this.order) return '';
    const s = this.order.status as unknown;
    return typeof s === 'number' ? (this.statusMap[s] ?? String(s)) : String(s);
  }

  isAtOrPast(status: string): boolean {
    return this.statusOrder.indexOf(this.statusStr) >= this.statusOrder.indexOf(status);
  }

  get subtotal(): number { return this.order?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0; }
  get tax(): number { return Math.round(this.subtotal * 0.05); }

  cancelOrder() {
    if (!this.order || !confirm('Cancel this order?')) return;
    this.cancelling = true;
    this.orderSvc.cancel(this.order.id).subscribe({
      next: () => { this.order = { ...this.order!, status: 'Cancelled' as any }; this.cancelling = false; },
      error: () => this.cancelling = false
    });
  }

  private loadDelivery(orderId: string) {
    this.deliverySvc.getByOrder(orderId).subscribe({ next: d => this.delivery = d, error: () => {} });
  }

  private connectHub(orderId: string) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(environment.deliveryHubUrl).withAutomaticReconnect().build();
    this.hub.on('LocationUpdated', (data: { orderId: string; lat: number; lng: number }) => {
      if (data.orderId === orderId && this.delivery)
        this.delivery = { ...this.delivery, currentLat: data.lat, currentLng: data.lng };
    });
    this.hub.on('DeliveryCompleted', (data: { orderId: string }) => {
      if (data.orderId === orderId) {
        if (this.order) this.order = { ...this.order, status: 'Delivered' as any };
        if (this.delivery) this.delivery = { ...this.delivery, status: 'Delivered', completedAt: new Date().toISOString() };
      }
    });
    this.hub.start().catch(() => {});
  }

  ngOnDestroy() { this.hub?.stop(); }
}
