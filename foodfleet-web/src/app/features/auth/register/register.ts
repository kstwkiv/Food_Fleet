import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-visual">
        <div class="visual-logo">🍔</div>
        <h2>Join FoodFleet</h2>
        <p>Create your account and start ordering in minutes.</p>
        <div class="features">
          <div class="feature">🛒 Easy ordering experience</div>
          <div class="feature">💳 Secure payments</div>
          <div class="feature">⭐ Rate & review restaurants</div>
        </div>
      </div>
      <div class="auth-form-side">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create account</h2>
            <p class="subtitle">Join FoodFleet today — it's free</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label>Full Name</label>
              <input formControlName="fullName" placeholder="John Doe" />
            </div>
            <div class="field">
              <label>Email address</label>
              <input type="email" formControlName="email" placeholder="you@example.com" />
            </div>
            <div class="field">
              <label>Mobile Number</label>
              <input formControlName="mobileNumber" placeholder="+91 9876543210" />
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" formControlName="password" placeholder="Min. 6 characters" />
            </div>
            <div class="field">
              <label>I am a</label>
              <select formControlName="role">
                <option value="Customer">Customer — I want to order food</option>
                <option value="RestaurantOwner">Restaurant Owner — I want to list my restaurant</option>
                <option value="DeliveryAgent">Delivery Agent — I want to deliver orders</option>
              </select>
            </div>

            <div class="error" *ngIf="error">{{ error }}</div>

            <button type="submit" [disabled]="loading" class="btn-primary">
              <span *ngIf="!loading">Create account →</span>
              <span *ngIf="loading">Creating account...</span>
            </button>
          </form>

          <div class="links">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: '../login/login.scss'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Customer']
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: (res) => {
        const routes: Record<string, string> = {
          Admin: '/admin/dashboard', Customer: '/restaurants',
          RestaurantOwner: '/owner/dashboard', DeliveryAgent: '/agent/dashboard'
        };
        this.router.navigate([routes[res.role] ?? '/']);
      },
      error: (err) => { this.error = err.error || 'Registration failed'; this.loading = false; }
    });
  }
}
