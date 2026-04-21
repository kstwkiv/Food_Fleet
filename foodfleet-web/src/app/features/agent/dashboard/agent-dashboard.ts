import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { DeliveryAgentDto } from '../../../core/models/delivery.models';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🚴 Delivery Dashboard</h2>
      </div>

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

        <div *ngIf="profile.currentLat" class="current-location">
          📍 Current location: {{ profile.currentLat | number:'1.4-4' }}, {{ profile.currentLng | number:'1.4-4' }}
        </div>

        <div class="location-section">
          <h4>📍 Update My Location</h4>
          <div class="loc-inputs">
            <input type="number" [(ngModel)]="lat" placeholder="Latitude" />
            <input type="number" [(ngModel)]="lng" placeholder="Longitude" />
            <button class="btn-update" (click)="updateLocation()">Update</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './agent-dashboard.scss'
})
export class AgentDashboardComponent implements OnInit {
  profile?: DeliveryAgentDto;
  loading = true;
  vehicleType = 'Bike';
  lat = 0;
  lng = 0;

  constructor(private svc: DeliveryService) {}

  ngOnInit() {
    this.svc.getMyProfile().subscribe({
      next: p => { this.profile = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  register() {
    this.svc.registerAgent(this.vehicleType).subscribe(p => this.profile = p);
  }

  toggleAvailability() {
    this.svc.toggleAvailability().subscribe(res => {
      this.profile = { ...this.profile!, isAvailable: res.isAvailable };
    });
  }

  updateLocation() {
    this.svc.updateLocation(this.profile!.id, this.lat, this.lng).subscribe(() => {
      this.profile = { ...this.profile!, currentLat: this.lat, currentLng: this.lng };
    });
  }
}
