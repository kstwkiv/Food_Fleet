import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { DeliveryService } from '../../../core/services/delivery.service';
import { OrderDto } from '../../../core/models/order.models';
import { DeliveryDto } from '../../../core/models/delivery.models';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" *ngIf="order">
      <div class="order-card">
        <div class="order-header">
          <h2>Order #{{ order.id | slice:0:8 }}...</h2>
          <span class="status-badge" [class]="order.status.toLowerCase()">{{ order.status }}</span>
        </div>

        <div class="order-meta">
          <span class="meta-chip">📍 {{ order.deliveryAddress }}</span>
          <span class="meta-chip">💳 {{ order.paymentMethod }}</span>
          <span class="meta-chip">📅 {{ order.createdAt | date:'medium' }}</span>
        </div>

        <div class="items-list">
          <h3>Items Ordered</h3>
          <div *ngFor="let item of order.items" class="order-item">
            <span class="item-name">{{ item.menuItemName }} × {{ item.quantity }}</span>
            <span class="item-price">₹{{ item.unitPrice * item.quantity }}</span>
          </div>
          <div class="total-row"><span>Total</span><span>₹{{ order.totalAmount }}</span></div>
        </div>
      </div>

      <div class="delivery-card" *ngIf="delivery">
        <h3>🚴 Live Delivery Tracking</h3>
        <div class="tracking-steps">
          <div class="tracking-step done">
            <div class="step-icon done">✓</div>
            <div class="step-info"><div class="step-label">Order Placed</div><div class="step-time">{{ order.createdAt | date:'shortTime' }}</div></div>
          </div>
          <div class="tracking-step" [class.done]="['Confirmed','Preparing','Ready','Delivered'].includes(order.status)">
            <div class="step-icon" [class.done]="['Confirmed','Preparing','Ready','Delivered'].includes(order.status)">✓</div>
            <div class="step-info"><div class="step-label">Confirmed</div></div>
          </div>
          <div class="tracking-step" [class.done]="['Preparing','Ready','Delivered'].includes(order.status)">
            <div class="step-icon" [class.done]="['Preparing','Ready','Delivered'].includes(order.status)">🍳</div>
            <div class="step-info"><div class="step-label">Preparing</div></div>
          </div>
          <div class="tracking-step" [class.done]="['Ready','Delivered'].includes(order.status)">
            <div class="step-icon" [class.done]="['Ready','Delivered'].includes(order.status)">📦</div>
            <div class="step-info"><div class="step-label">Ready for Pickup</div></div>
          </div>
          <div class="tracking-step" [class.done]="order.status === 'Delivered'">
            <div class="step-icon" [class.done]="order.status === 'Delivered'">🏠</div>
            <div class="step-info">
              <div class="step-label">Delivered</div>
              <div class="step-time" *ngIf="delivery.completedAt">{{ delivery.completedAt | date:'shortTime' }}</div>
            </div>
          </div>
        </div>
        <div *ngIf="delivery.currentLat && delivery.currentLng" class="location-info">
          📍 Agent location: {{ delivery.currentLat | number:'1.4-4' }}, {{ delivery.currentLng | number:'1.4-4' }}
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading">Loading order details...</div>
  `,
  styleUrl: './order-detail.scss'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order?: OrderDto;
  delivery?: DeliveryDto;
  loading = true;
  private hub?: signalR.HubConnection;

  constructor(
    private route: ActivatedRoute,
    private orderSvc: OrderService,
    private deliverySvc: DeliveryService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderSvc.getById(id).subscribe({
      next: o => {
        this.order = o;
        this.loading = false;
        this.loadDelivery(id);
        this.connectHub(id);
      },
      error: () => this.loading = false
    });
  }

  private loadDelivery(orderId: string) {
    this.deliverySvc.getByOrder(orderId).subscribe({
      next: d => this.delivery = d,
      error: () => {}
    });
  }

  private connectHub(orderId: string) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(environment.deliveryHubUrl)
      .withAutomaticReconnect()
      .build();

    this.hub.on('LocationUpdated', (data: { orderId: string; lat: number; lng: number }) => {
      if (data.orderId === orderId && this.delivery) {
        this.delivery = { ...this.delivery, currentLat: data.lat, currentLng: data.lng };
      }
    });

    this.hub.on('DeliveryCompleted', (data: { orderId: string }) => {
      if (data.orderId === orderId && this.delivery) {
        this.delivery = { ...this.delivery, status: 'Delivered', completedAt: new Date().toISOString() };
      }
    });

    this.hub.start().catch(() => {});
  }

  ngOnDestroy() { this.hub?.stop(); }
}
