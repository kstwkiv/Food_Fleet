import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RestaurantDto, CreateRestaurantRequest, ReviewDto, CreateReviewRequest, MenuCategoryDto } from '../models/restaurant.models';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private base = `${environment.apiUrl}/restaurants`;
  private reviewBase = `${environment.apiUrl}/reviews`;
  private menuBase = `${environment.apiUrl}/menu`;
  private adminBase = `${environment.apiUrl}/admin/restaurants`;

  constructor(private http: HttpClient) {}

  getAll(search?: string) {
    const params: Record<string, string> = search ? { search } : {};
    return this.http.get<RestaurantDto[]>(this.base, { params });
  }

  getById(id: string) {
    return this.http.get<RestaurantDto>(`${this.base}/${id}`);
  }

  create(req: CreateRestaurantRequest) {
    return this.http.post<RestaurantDto>(this.base, req);
  }

  toggleAvailability(id: string) {
    return this.http.patch<{ id: string; isOpen: boolean }>(`${this.base}/${id}/availability`, {});
  }

  getMenu(restaurantId: string) {
    return this.http.get<MenuCategoryDto[]>(`${this.menuBase}/restaurant/${restaurantId}`);
  }

  getReviews(restaurantId: string) {
    return this.http.get<ReviewDto[]>(`${this.reviewBase}/restaurant/${restaurantId}`);
  }

  createReview(req: CreateReviewRequest) {
    return this.http.post<ReviewDto>(this.reviewBase, req);
  }

  respondToReview(reviewId: string, response: string) {
    return this.http.post<ReviewDto>(`${this.reviewBase}/${reviewId}/response`, { response });
  }

  // Admin
  adminGetAll(status?: string) {
    const params: Record<string, string> = status ? { status } : {};
    return this.http.get<RestaurantDto[]>(this.adminBase, { params });
  }

  approve(id: string) {
    return this.http.patch<RestaurantDto>(`${this.adminBase}/${id}/approve`, {});
  }

  reject(id: string, reason: string) {
    return this.http.patch(`${this.adminBase}/${id}/reject`, { reason });
  }

  suspend(id: string, reason: string) {
    return this.http.patch(`${this.adminBase}/${id}/suspend`, { reason });
  }
}
