import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { PurchaseOrder } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-po-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatMenuModule, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header [title]="'Purchase Order ' + (po?.number || '')">
      <app-status-badge [status]="po?.status || ''"></app-status-badge>
      <button mat-stroked-button [matMenuTriggerFor]="actions"><mat-icon>more_vert</mat-icon> Actions</button>
      <mat-menu #actions="matMenu">
        <button mat-menu-item (click)="updateStatus('SENT')" [disabled]="po?.status !== 'DRAFT'">Mark Sent</button>
        <button mat-menu-item (click)="updateStatus('RECEIVED')" [disabled]="po?.status !== 'SENT'">Mark Received</button>
        <button mat-menu-item (click)="updateStatus('CANCELLED')">Cancel</button>
      </mat-menu>
    </app-page-header>
    <mat-card *ngIf="po">
      <mat-card-content>
        <div class="info-grid">
          <div><label>Supplier</label><p>{{ po.contact?.name }}</p></div>
          <div><label>Date</label><p>{{ po.date | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Expected</label><p>{{ po.expectedDate | date:'dd/MM/yyyy' }}</p></div>
        </div>
        <table mat-table [dataSource]="po.lines || []">
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description }}</td></ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="number-col">Qty</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.qty }}</td></ng-container>
          <ng-container matColumnDef="unitPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.unitPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div class="totals">
          <div>Subtotal: {{ po.subtotal | thb }}</div>
          <div>VAT: {{ po.vatAmount | thb }}</div>
          <div class="total-row">Total: {{ po.total | thb }}</div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; } label { font-size: 12px; color: #757575; } p { margin: 4px 0; } .totals { text-align: right; margin-top: 16px; } .totals div { margin: 4px 0; } .total-row { font-size: 18px; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 8px; }`],
})
export class PoDetailComponent implements OnInit {
  po?: PurchaseOrder;
  cols = ['description', 'qty', 'unitPrice', 'amount'];

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.api.get<PurchaseOrder>(`purchase-orders/${this.route.snapshot.params['id']}`).subscribe(d => this.po = d); }

  updateStatus(status: string) {
    this.api.patch(`purchase-orders/${this.po?.id}/status`, { status }).subscribe({ next: () => this.load(), error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
