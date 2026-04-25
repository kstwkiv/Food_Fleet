import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { DeliveryAgentDto } from '../../../core/models/delivery.models';

interface ActiveDelivery {
  id: string;
  orderId: string;
  status: string;
  currentLat?: number;
  currentLng?: number;
  assignedAt: string;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🚴 Delivery Dashboard</h2>
      </div>

      <!-- Register -->
      <div *ngIf="!profile && !loading" class="register-card">
        <div class="icon">🚴</div>
        <h3>Become a Delivery Agent</h3>
        <p>Register your vehicle and start earning with FoodFleet.</p>
        <div class="field">
          <label>Vehicle Type</label>
          <select [(ngModel)]="vehicleType">
            <option value="Bike">🏍️ Bike</option>
            <option value="Scooter">🛵 Scooter</option>
            <option value="Car">🚗 Car</option>
            <option value="Bicycle">🚲 Bicycle</option>
          </select>
        </div>
        <button class="btn-primary" (click)="register()">Register Now →</button>
      </div>

      <!-- Profile -->
      <div *ngIf="profile" class="profile-card">
        <div class="profile-header">
          <div class="profile-info">
            <h3>{{ profile.fullName }}</h3>
            <p>{{ profile.vehicleType }} · Agent ID: {{ profile.id | slice:0:8 }}</p>
          </div>
          <button class="availability-btn" (click)="toggleAvailability()"
            [class.available]="profile.isAvailable"
            [class.unavailable]="!profile.isAvailable">
            {{ profile.isAvailable ? '🟢 Available' : '🔴 Unavailable' }}
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-box"><div class="val">{{ profile.totalDeliveries }}</div><div class="lbl">Deliveries</div></div>
          <div class="stat-box"><div class="val">{{ profile.vehicleType }}</div><div class="lbl">Vehicle</div></div>
          <div class="stat-box"><div class="val">{{ profile.isAvailable ? 'Online' : 'Offline' }}</div><div class="lbl">Status</div></div>
        </div>

        <!-- Active Delivery -->
        <div *ngIf="activeDelivery" class="active-delivery">
          <div class="delivery-header">
            <h4>📦 Active Delivery</h4>
            <span class="delivery-status">{{ activeDelivery.status }}</span>
          </div>
          <div class="delivery-info">
            <div class="info-row"><span>Order ID</span><strong>#{{ activeDelivery.orderId | slice:0:8 }}...</strong></div>
            <div class="info-row"><span>Assigned at</span><strong>{{ activeDelivery.assignedAt | date:'shortTime' }}</strong></div>
            <div class="info-row" *ngIf="activeDelivery.currentLat">
              <span>Last location</span>
              <strong>{{ activeDelivery.currentLat | number:'1.4-4' }}, {{ activeDelivery.currentLng | number:'1.4-4' }}</strong>
            </div>
          </div>
          <div class="delivery-actions">
            <button class="btn-gps" (click)="shareLocation()" [disabled]="sharingLocation">
              {{ sharingLocation ? '📡 Sharing...' : '📍 Share My Location' }}
            </button>
            <button class="btn-complete" (click)="completeDelivery()">
              ✅ Mark as Delivered
            </button>
          </div>
          <div class="gps-status" *ngIf="gpsStatus">{{ gpsStatus }}</div>
        </div>

        <div *ngIf="!activeDelivery && profile.isAvailable" class="no-delivery">
          <div class="nd-icon">⏳</div>
          <p>Waiting for an order to be assigned...</p>
          <button class="btn-refresh" (click)="checkDelivery()">🔄 Check for orders</button>
        </div>

        <!-- Manual Location -->
        <div class="location-section" *ngIf="!activeDelivery">
          <h4>📍 Update My Location</h4>
          <div class="loc-inputs">
            <input type="number" [(ngModel)]="lat" placeholder="Latitude" />
            <input type="number" [(ngModel)]="lng" placeholder="Longitude" />
            <button class="btn-update" (click)="updateLocation()">Update</button>
          </div>
          <button class="btn-gps-auto" (click)="useGPS()">📡 Use GPS</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './agent-dashboard.scss'
})
export class AgentDashboardComponent implements OnInit, OnDestroy {
  profile?: DeliveryAgentDto;
  activeDelivery?: ActiveDelivery;
  loading = true;
  vehicleType = 'Bike';
  lat = 0;
  lng = 0;
  sharingLocation = false;
  gpsStatus = '';
  private locationInterval?: ReturnType<typeof setInterval>;

  constructor(private svc: DeliveryService) {}

  ngOnInit() {
    this.svc.getMyProfile().subscribe({
      next: p => { this.profile = p; this.loading = false; this.checkDelivery(); },
      error: () => this.loading = false
    });
  }

  ngOnDestroy() {
    if (this.locationInterval) clearInterval(this.locationInterval);
  }

  register() {
    this.svc.registerAgent(this.vehicleType).subscribe(p => {
      this.profile = p;
      this.checkDelivery();
    });
  }

  toggleAvailability() {
    this.svc.toggleAvailability().subscribe(res => {
      this.profile = { ...this.profile!, isAvailable: res.isAvailable };
    });
  }

  checkDelivery() {
    this.svc.getMyDelivery().subscribe({
      next: d => this.activeDelivery = d,
      error: () => this.activeDelivery = undefined
    });
  }

  shareLocation() {
    if (!navigator.geolocation) { this.gpsStatus = '❌ GPS not supported'; return; }
    this.sharingLocation = true;
    this.gpsStatus = '📡 Getting location...';

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        this.svc.updateLocation(this.profile!.id, latitude, longitude).subscribe({
          next: () => {
            this.gpsStatus = `✅ Location shared: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            this.sharingLocation = false;
            if (this.activeDelivery) {
              this.activeDelivery = { ...this.activeDelivery, currentLat: latitude, currentLng: longitude };
            }
          },
          error: () => { this.gpsStatus = '❌ Failed to share location'; this.sharingLocation = false; }
        });
      },
      err => { this.gpsStatus = `❌ GPS error: ${err.message}`; this.sharingLocation = false; }
    );
  }

  completeDelivery() {
    if (!this.activeDelivery || !confirm('Mark this order as delivered?')) return;
    this.svc.complete(this.activeDelivery.orderId).subscribe({
      next: () => {
        this.activeDelivery = undefined;
        if (this.profile) this.profile = { ...this.profile, totalDeliveries: this.profile.totalDeliveries + 1, isAvailable: true };
      },
      error: () => alert('Failed to complete delivery')
    });
  }

  updateLocation() {
    this.svc.updateLocation(this.profile!.id, this.lat, this.lng).subscribe(() => {
      this.profile = { ...this.profile!, currentLat: this.lat, currentLng: this.lng };
    });
  }

  useGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.lat = pos.coords.latitude;
      this.lng = pos.coords.longitude;
    });
  }
}
