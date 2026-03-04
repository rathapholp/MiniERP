import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { Invoice } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';
import { RecordPaymentDialogComponent } from '../../receipts/record-payment-dialog/record-payment-dialog.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatMenuModule, MatDialogModule, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header [title]="'Invoice ' + (inv?.number || '')">
      <app-status-badge [status]="inv?.status || ''"></app-status-badge>
      <button mat-stroked-button [matMenuTriggerFor]="actions"><mat-icon>more_vert</mat-icon> Actions</button>
      <mat-menu #actions="matMenu">
        <button mat-menu-item (click)="updateStatus('SENT')" [disabled]="inv?.status !== 'DRAFT'">Mark Sent</button>
        <button mat-menu-item (click)="recordPayment()" [disabled]="inv?.status === 'PAID' || inv?.status === 'VOID' || inv?.status === 'CANCELLED'">Record Payment</button>
        <button mat-menu-item (click)="voidInvoice()">Void Invoice</button>
      </mat-menu>
    </app-page-header>
    <mat-card *ngIf="inv">
      <mat-card-content>
        <div class="info-grid">
          <div><label>Customer</label><p>{{ inv.contact?.name }}</p></div>
          <div><label>Date</label><p>{{ inv.date | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Due Date</label><p>{{ inv.dueDate | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Paid Amount</label><p>{{ inv.paidAmount | thb }}</p></div>
          <div><label>Balance</label><p>{{ (inv.total - inv.paidAmount) | thb }}</p></div>
        </div>
        <table mat-table [dataSource]="inv.lines || []">
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description }}</td></ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="number-col">Qty</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.qty }}</td></ng-container>
          <ng-container matColumnDef="unitPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.unitPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="vatRate"><th mat-header-cell *matHeaderCellDef class="number-col">VAT%</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.vatRate }}%</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="lineCols"></tr>
          <tr mat-row *matRowDef="let row; columns: lineCols;"></tr>
        </table>
        <div class="totals">
          <div>Subtotal: {{ inv.subtotal | thb }}</div>
          <div>VAT: {{ inv.vatAmount | thb }}</div>
          <div class="total-row">Total: {{ inv.total | thb }}</div>
        </div>
        <div *ngIf="inv.receipts?.length" style="margin-top:24px">
          <h3>Payment History</h3>
          <table mat-table [dataSource]="inv.receipts || []">
            <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Receipt</th><td mat-cell *matCellDef="let r">{{ r.number }}</td></ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
            <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th><td mat-cell *matCellDef="let r">{{ r.paymentMethod }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="receiptCols"></tr>
            <tr mat-row *matRowDef="let row; columns: receiptCols;"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.info-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; } label { font-size: 12px; color: #757575; } p { margin: 4px 0; } .totals { text-align: right; margin: 16px 0; } .totals div { margin: 4px 0; } .total-row { font-size: 18px; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 8px; }`],
})
export class InvoiceDetailComponent implements OnInit {
  inv?: Invoice;
  lineCols = ['description', 'qty', 'unitPrice', 'vatRate', 'amount'];
  receiptCols = ['number', 'date', 'amount', 'method'];

  constructor(private route: ActivatedRoute, private api: ApiService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.api.get<Invoice>(`invoices/${this.route.snapshot.params['id']}`).subscribe(d => this.inv = d); }

  updateStatus(status: string) {
    this.api.patch(`invoices/${this.inv?.id}/status`, { status }).subscribe({ next: () => this.load(), error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }

  recordPayment() {
    const ref = this.dialog.open(RecordPaymentDialogComponent, { width: '400px', data: { invoiceId: this.inv?.id, balance: Number(this.inv?.total) - Number(this.inv?.paidAmount) } });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Payment recorded', 'OK', { duration: 2000 }); this.load(); } });
  }

  voidInvoice() {
    if (!confirm('Void this invoice?')) return;
    this.api.post(`invoices/${this.inv?.id}/void`, {}).subscribe({ next: () => this.load(), error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
