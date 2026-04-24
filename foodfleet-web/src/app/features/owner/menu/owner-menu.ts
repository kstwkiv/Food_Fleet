import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuCategoryDto, MenuItemDto } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-owner-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>🍽️ Menu Management</h2>
          <p class="subtitle">Add categories and dishes to your restaurant</p>
        </div>
        <a routerLink="/owner/dashboard" class="btn-back">← Dashboard</a>
      </div>

      <!-- Add Category -->
      <div class="card">
        <h3>Add Category</h3>
        <div class="inline-form">
          <input [(ngModel)]="newCategoryName" placeholder="e.g. Starters, Main Course, Desserts" />
          <button class="btn-primary" (click)="addCategory()" [disabled]="!newCategoryName.trim()">+ Add</button>
        </div>
      </div>

      <!-- Categories & Items -->
      <div *ngFor="let cat of categories" class="category-block">
        <div class="category-header">
          <h3>{{ cat.name }}</h3>
          <span class="item-count">{{ cat.items.length }} items</span>
        </div>

        <!-- Existing items -->
        <div *ngFor="let item of cat.items" class="item-row">
          <img *ngIf="item.imageUrl" [src]="item.imageUrl" class="item-img" />
          <div class="item-img placeholder" *ngIf="!item.imageUrl">🍽️</div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-desc">{{ item.description }}</div>
            <div class="item-tags" *ngIf="item.dietaryTags">🏷️ {{ item.dietaryTags }}</div>
          </div>
          <div class="item-price">₹{{ item.price }}</div>
          <div class="item-actions">
            <button class="btn-toggle-avail" (click)="toggleAvail(item)"
              [class.unavail]="!item.isAvailable">
              {{ item.isAvailable ? 'Available' : 'Unavailable' }}
            </button>
            <button class="btn-delete" (click)="deleteItem(item, cat)">🗑️</button>
          </div>
        </div>

        <!-- Add item form -->
        <div class="add-item-form" *ngIf="addingTo === cat.id; else addBtn">
          <div class="form-grid">
            <input [(ngModel)]="newItem.name" placeholder="Item name *" />
            <input [(ngModel)]="newItem.description" placeholder="Description" />
            <input [(ngModel)]="newItem.price" type="number" placeholder="Price (₹) *" />
            <input [(ngModel)]="newItem.dietaryTags" placeholder="Tags (Veg, Spicy, etc.)" />
            <input [(ngModel)]="newItem.imageUrl" placeholder="Image URL (optional)" />
          </div>
          <div class="form-actions">
            <button class="btn-primary" (click)="addItem(cat)" [disabled]="!newItem.name || !newItem.price">Save Item</button>
            <button class="btn-cancel" (click)="addingTo = null">Cancel</button>
          </div>
        </div>
        <ng-template #addBtn>
          <button class="btn-add-item" (click)="startAddItem(cat.id)">+ Add Item</button>
        </ng-template>
      </div>

      <div *ngIf="categories.length === 0" class="empty">
        No categories yet — add one above to get started.
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .subtitle { color: #6b7280; font-size: 0.9rem; margin-top: 0.25rem; }
    .btn-back { padding: 0.5rem 1rem; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #374151; font-size: 0.875rem; font-weight: 600; }
    .card { background: white; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
    .card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; }
    .inline-form { display: flex; gap: 0.75rem; }
    .inline-form input { flex: 1; padding: 0.6rem 0.875rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; }
    .btn-primary { padding: 0.6rem 1.25rem; background: #ff6b35; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .category-block { background: white; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 1.25rem; }
    .category-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .category-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
    .item-count { background: #f3f4f6; color: #6b7280; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .item-row { display: flex; align-items: center; gap: 0.875rem; padding: 0.75rem 0; border-top: 1px solid #f3f4f6; }
    .item-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
    .item-img.placeholder { width: 48px; height: 48px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .item-info { flex: 1; }
    .item-name { font-weight: 600; font-size: 0.9rem; }
    .item-desc { color: #6b7280; font-size: 0.8rem; }
    .item-tags { color: #9ca3af; font-size: 0.75rem; margin-top: 0.2rem; }
    .item-price { font-weight: 700; font-size: 0.95rem; min-width: 60px; text-align: right; }
    .item-actions { display: flex; gap: 0.4rem; align-items: center; }
    .btn-toggle-avail { padding: 0.25rem 0.6rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600; background: #d1fae5; color: #065f46; }
    .btn-toggle-avail.unavail { background: #fee2e2; color: #991b1b; }
    .btn-delete { background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.5; }
    .btn-delete:hover { opacity: 1; }
    .add-item-form { margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.75rem; }
    .form-grid input { padding: 0.55rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
    .form-actions { display: flex; gap: 0.5rem; }
    .btn-cancel { padding: 0.6rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem; }
    .btn-add-item { margin-top: 0.75rem; padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; width: 100%; }
    .btn-add-item:hover { background: #e5e7eb; }
    .empty { text-align: center; color: #9ca3af; padding: 3rem; background: white; border-radius: 12px; }
  `]
})
export class OwnerMenuComponent implements OnInit {
  restaurantId = '';
  categories: MenuCategoryDto[] = [];
  newCategoryName = '';
  addingTo: string | null = null;
  newItem = { name: '', description: '', price: 0, dietaryTags: '', imageUrl: '' };

  constructor(private route: ActivatedRoute, private restaurantSvc: RestaurantService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.restaurantId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load() {
    this.restaurantSvc.getMenu(this.restaurantId).subscribe(c => { this.categories = c; this.cdr.markForCheck(); });
  }

  addCategory() {
    if (!this.newCategoryName.trim()) return;
    this.restaurantSvc.createCategory(this.restaurantId, this.newCategoryName.trim()).subscribe(cat => {
      this.categories.push(cat);
      this.newCategoryName = '';
      this.cdr.markForCheck();
    });
  }

  startAddItem(categoryId: string) {
    this.addingTo = categoryId;
    this.newItem = { name: '', description: '', price: 0, dietaryTags: '', imageUrl: '' };
  }

  addItem(cat: MenuCategoryDto) {
    this.restaurantSvc.createMenuItem(this.restaurantId, {
      categoryId: cat.id,
      name: this.newItem.name,
      description: this.newItem.description,
      price: this.newItem.price,
      dietaryTags: this.newItem.dietaryTags,
      imageUrl: this.newItem.imageUrl || undefined
    }).subscribe(item => {
      cat.items.push(item);
      this.addingTo = null;
      this.cdr.markForCheck();
    });
  }

  toggleAvail(item: MenuItemDto) {
    this.restaurantSvc.updateMenuItem(item.id, { isAvailable: !item.isAvailable }).subscribe(updated => {
      item.isAvailable = updated.isAvailable;
      this.cdr.markForCheck();
    });
  }

  deleteItem(item: MenuItemDto, cat: MenuCategoryDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.restaurantSvc.deleteMenuItem(item.id).subscribe(() => {
      cat.items = cat.items.filter(i => i.id !== item.id);
      this.cdr.markForCheck();
    });
  }
}
