import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/restaurants', pathMatch: 'full' },

  // Auth
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
    ]
  },

  // Public
  { path: 'restaurants', loadComponent: () => import('./features/restaurants/restaurant-list/restaurant-list').then(m => m.RestaurantListComponent) },
  { path: 'restaurants/:id', loadComponent: () => import('./features/restaurants/restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailComponent) },

  // Customer
  { path: 'orders', loadComponent: () => import('./features/orders/order-history/order-history').then(m => m.OrderHistoryComponent), canActivate: [authGuard] },
  { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail/order-detail').then(m => m.OrderDetailComponent), canActivate: [authGuard] },

  // Restaurant Owner
  { path: 'owner/dashboard', loadComponent: () => import('./features/owner/dashboard/owner-dashboard').then(m => m.OwnerDashboardComponent), canActivate: [roleGuard(['RestaurantOwner'])] },

  // Admin
  { path: 'admin/dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent), canActivate: [roleGuard(['Admin'])] },

  // Delivery Agent
  { path: 'agent/dashboard', loadComponent: () => import('./features/agent/dashboard/agent-dashboard').then(m => m.AgentDashboardComponent), canActivate: [roleGuard(['DeliveryAgent'])] },

  { path: '**', redirectTo: '/restaurants' }
];
