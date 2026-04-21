import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-visual">
        <div class="visual-logo">🍔</div>
        <h2>Welcome back!</h2>
        <p>Sign in to order from your favourite restaurants.</p>
        <div class="features">
          <div class="feature">🚀 Fast delivery to your door</div>
          <div class="feature">🍽️ Hundreds of restaurants</div>
          <div class="feature">📍 Real-time order tracking</div>
        </div>
      </div>
      <div class="auth-form-side">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Sign in</h2>
            <p class="subtitle">Welcome back to FoodFleet</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label>Email address</label>
              <input type="email" formControlName="email" placeholder="you@example.com" />
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" formControlName="password" placeholder="••••••••" />
            </div>

            <div class="error" *ngIf="error">{{ error }}</div>

            <button type="submit" [disabled]="loading" class="btn-primary">
              <span *ngIf="!loading">Sign in →</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

          <div class="links">
            <a routerLink="/auth/forgot-password">Forgot password?</a>
            <span>·</span>
            <a routerLink="/auth/register">Create account</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: (res) => this.redirectByRole(res.role),
      error: (err) => {
        this.error = err.error || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  private redirectByRole(role: string) {
    const routes: Record<string, string> = {
      Admin: '/admin/dashboard',
      Customer: '/restaurants',
      RestaurantOwner: '/owner/dashboard',
      DeliveryAgent: '/agent/dashboard'
    };
    this.router.navigate([routes[role] ?? '/']);
  }
}
