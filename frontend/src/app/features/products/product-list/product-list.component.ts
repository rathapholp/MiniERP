import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Products" newLink="/products/new" newLabel="New Product"></app-page-header>
    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" style="margin-bottom:16px">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="search" placeholder="Code or name...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <table mat-table [dataSource]="products">
          <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.code }}</td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category?.name }}</td></ng-container>
          <ng-container matColumnDef="unit"><th mat-header-cell *matHeaderCellDef>Unit</th><td mat-cell *matCellDef="let r">{{ r.unit }}</td></ng-container>
          <ng-container matColumnDef="sellPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Sell Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.sellPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="stockQty"><th mat-header-cell *matHeaderCellDef class="number-col">Stock</th><td mat-cell *matCellDef="let r" class="number-col" [style.color]="r.stockQty <= 5 ? '#c62828' : 'inherit'">{{ r.stockQty }}</td></ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r" class="mat-column-actions">
              <a mat-icon-button [routerLink]="['/products', r.id, 'edit']"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button color="warn" (click)="delete(r)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p *ngIf="products.length === 0" style="text-align:center;color:#757575;padding:32px">No products found</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  columns = ['code', 'name', 'category', 'unit', 'sellPrice', 'stockQty', 'actions'];
  search = new FormControl('');

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.load());
  }

  load() { this.api.get<Product[]>('products', { search: this.search.value }).subscribe(d => this.products = d); }

  delete(p: Product) {
    if (!confirm(`Delete ${p.name}?`)) return;
    this.api.delete(`products/${p.id}`).subscribe({ next: () => { this.snack.open('Deleted', 'OK', { duration: 2000 }); this.load(); }, error: () => this.snack.open('Cannot delete', 'OK', { duration: 3000 }) });
  }
}
