import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Stock Movements">
      <a mat-stroked-button routerLink="/inventory"><mat-icon>arrow_back</mat-icon> Back to Stock</a>
    </app-page-header>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="movements">
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</td></ng-container>
          <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.product?.code }} - {{ r.product?.name }}</td></ng-container>
          <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let r">
              <span class="status-chip" [ngClass]="r.type === 'IN' ? 'accepted' : r.type === 'OUT' ? 'overdue' : 'sent'">{{ r.type }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="number-col">Qty</th><td mat-cell *matCellDef="let r" class="number-col" [style.color]="r.qty < 0 ? '#c62828' : '#2e7d32'">{{ r.qty > 0 ? '+' : '' }}{{ r.qty }}</td></ng-container>
          <ng-container matColumnDef="balance"><th mat-header-cell *matHeaderCellDef class="number-col">Balance</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.balanceQty }}</td></ng-container>
          <ng-container matColumnDef="ref"><th mat-header-cell *matHeaderCellDef>Reference</th><td mat-cell *matCellDef="let r">{{ r.refType }} #{{ r.refId }}</td></ng-container>
          <ng-container matColumnDef="note"><th mat-header-cell *matHeaderCellDef>Note</th><td mat-cell *matCellDef="let r">{{ r.note }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p *ngIf="movements.length === 0" style="text-align:center;color:#757575;padding:32px">No movements found</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class StockMovementsComponent implements OnInit {
  movements: any[] = [];
  columns = ['date', 'product', 'type', 'qty', 'balance', 'ref', 'note'];

  constructor(private api: ApiService) {}

  ngOnInit() { this.api.get<any>('inventory/movements').subscribe(d => this.movements = d.data || []); }
}
