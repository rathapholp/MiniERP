import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Product' : 'New Product'"></app-page-header>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Code *</mat-label><input matInput formControlName="code"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Name *</mat-label><input matInput formControlName="name"></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Unit</mat-label><input matInput formControlName="unit"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option [value]="null">None</mat-option>
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>VAT Rate (%)</mat-label><input matInput type="number" formControlName="vatRate"></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Cost Price</mat-label><input matInput type="number" formControlName="costPrice"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Sell Price</mat-label><input matInput type="number" formControlName="sellPrice"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Stock Qty</mat-label><input matInput type="number" formControlName="stockQty"></mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" routerLink="/products">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.form-row { display: flex; gap: 16px; margin-bottom: 8px; } .form-row mat-form-field { flex: 1; } .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }`],
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  categories: Category[] = [];

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private route: ActivatedRoute, private snack: MatSnackBar) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      unit: ['pcs'],
      categoryId: [null],
      costPrice: [0],
      sellPrice: [0],
      vatRate: [7],
      stockQty: [0],
    });
  }

  ngOnInit() {
    this.api.get<Category[]>('categories').subscribe(c => this.categories = c);
    this.id = this.route.snapshot.params['id'];
    this.isEdit = !!this.id;
    if (this.isEdit) this.api.get<any>(`products/${this.id}`).subscribe(d => this.form.patchValue(d));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const obs = this.isEdit ? this.api.put(`products/${this.id}`, this.form.value) : this.api.post('products', this.form.value);
    obs.subscribe({ next: () => { this.snack.open('Saved', 'OK', { duration: 2000 }); this.router.navigate(['/products']); }, error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
