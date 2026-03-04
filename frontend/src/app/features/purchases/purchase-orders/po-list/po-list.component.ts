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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PurchaseOrder } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header title="Purchase Orders" newLink="/purchases/orders/new" newLabel="New PO"></app-page-header>
    <mat-card>
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput [formControl]="search"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Number</th><td mat-cell *matCellDef="let r"><a [routerLink]="['/purchases/orders', r.id]">{{ r.number }}</a></td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="contact"><th mat-header-cell *matHeaderCellDef>Supplier</th><td mat-cell *matCellDef="let r">{{ r.contact?.name }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="number-col">Total</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.total | thb }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r"><a mat-icon-button [routerLink]="['/purchases/orders', r.id]"><mat-icon>visibility</mat-icon></a></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.filters { display: flex; gap: 16px; margin-bottom: 16px; }`],
})
export class PoListComponent implements OnInit {
  items: PurchaseOrder[] = [];
  columns = ['number', 'date', 'contact', 'total', 'status', 'actions'];
  search = new FormControl('');
  statusFilter = new FormControl('');
  statuses = ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300)).subscribe(() => this.load());
    this.statusFilter.valueChanges.subscribe(() => this.load());
  }

  load() { this.api.get<PurchaseOrder[]>('purchase-orders', { search: this.search.value, status: this.statusFilter.value }).subscribe(d => this.items = d); }
}
