import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { RestaurantDto } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero-content">
          <div class="hero-tag">🔥 100+ restaurants near you</div>
          <h1>Hungry? We've got<br><span>you covered.</span></h1>
          <p class="hero-sub">Order from the best local restaurants with fast delivery.</p>
          <div class="search-bar">
            <input [(ngModel)]="query" (keyup.enter)="search()" placeholder="Search restaurants, cuisines, dishes..." />
            <button (click)="search()">🔍 Search</button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat"><div class="stat-num">100+</div><div class="stat-lbl">Restaurants</div></div>
          <div class="stat"><div class="stat-num">30 min</div><div class="stat-lbl">Avg Delivery</div></div>
          <div class="stat"><div class="stat-num">4.8★</div><div class="stat-lbl">Avg Rating</div></div>
        </div>
      </div>

      <div class="container">
        <div *ngIf="loading" class="loading-state">
          <div class="icon">🍽️</div>
          <p>Finding restaurants near you...</p>
        </div>

        <ng-container *ngIf="!loading">
          <div class="section-header">
            <h2>{{ query ? 'Results for "' + query + '"' : 'All Restaurants' }}</h2>
            <span class="count">{{ restaurants.length }} found</span>
          </div>

          <div class="grid">
            <a *ngFor="let r of restaurants" [routerLink]="['/restaurants', r.id]" class="card">
              <div class="card-img">
                <img *ngIf="r.logoUrl" [src]="r.logoUrl" [alt]="r.name" />
                <div *ngIf="!r.logoUrl" class="placeholder-img">🍽️</div>
                <span class="card-badge" [class.open]="r.isOpen" [class.closed]="!r.isOpen">
                  {{ r.isOpen ? '● Open' : '● Closed' }}
                </span>
              </div>
              <div class="card-body">
                <h3>{{ r.name }}</h3>
                <p class="cuisine">🍴 {{ r.cuisineTypes }}</p>
                <div class="card-meta">
                  <div class="meta-item"><span class="meta-val">⭐ {{ r.averageRating | number:'1.1-1' }}</span>{{ r.totalReviews }} reviews</div>
                  <div class="meta-item"><span class="meta-val">🕐 {{ r.estimatedDeliveryMinutes }}m</span>Delivery</div>
                  <div class="meta-item"><span class="meta-val">₹{{ r.minimumOrderAmount }}</span>Min order</div>
                </div>
              </div>
            </a>
          </div>

          <div *ngIf="restaurants.length === 0" class="empty-state">
            <div class="icon">🔍</div>
            <p>No restaurants found. Try a different search.</p>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrl: './restaurant-list.scss'
})
export class RestaurantListComponent implements OnInit {
  restaurants: RestaurantDto[] = [];
  loading = true;
  query = '';

  constructor(private svc: RestaurantService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: (data) => { this.restaurants = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  search() {
    this.loading = true;
    this.svc.getAll(this.query).subscribe({
      next: (data) => { this.restaurants = data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
