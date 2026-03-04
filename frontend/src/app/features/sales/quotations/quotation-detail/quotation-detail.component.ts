import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { Quotation } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatMenuModule, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header [title]="'Quotation ' + (qt?.number || '')">
      <app-status-badge [status]="qt?.status || ''"></app-status-badge>
      <button mat-stroked-button [matMenuTriggerFor]="actions"><mat-icon>more_vert</mat-icon> Actions</button>
      <mat-menu #actions="matMenu">
        <button mat-menu-item (click)="updateStatus('SENT')" [disabled]="qt?.status !== 'DRAFT'">Mark Sent</button>
        <button mat-menu-item (click)="updateStatus('ACCEPTED')" [disabled]="qt?.status !== 'SENT'">Mark Accepted</button>
        <button mat-menu-item (click)="updateStatus('REJECTED')" [disabled]="qt?.status !== 'SENT'">Mark Rejected</button>
        <button mat-menu-item (click)="convertToInvoice()" [disabled]="qt?.status !== 'ACCEPTED'">Convert to Invoice</button>
        <button mat-menu-item (click)="updateStatus('CANCELLED')">Cancel</button>
      </mat-menu>
    </app-page-header>
    <mat-card *ngIf="qt">
      <mat-card-content>
        <div class="info-grid">
          <div><label>Customer</label><p>{{ qt.contact?.name }}</p></div>
          <div><label>Date</label><p>{{ qt.date | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Valid Until</label><p>{{ qt.validUntil | date:'dd/MM/yyyy' }}</p></div>
        </div>
        <table mat-table [dataSource]="qt.lines || []" class="lines-table">
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description }}</td></ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="number-col">Qty</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.qty }}</td></ng-container>
          <ng-container matColumnDef="unitPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Unit Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.unitPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="vatRate"><th mat-header-cell *matHeaderCellDef class="number-col">VAT%</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.vatRate }}%</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="lineCols"></tr>
          <tr mat-row *matRowDef="let row; columns: lineCols;"></tr>
        </table>
        <div class="totals">
          <div>Subtotal: {{ qt.subtotal | thb }}</div>
          <div>VAT: {{ qt.vatAmount | thb }}</div>
          <div class="total-row">Total: {{ qt.total | thb }}</div>
        </div>
        <p *ngIf="qt.note" class="note"><strong>Note:</strong> {{ qt.note }}</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; } label { font-size: 12px; color: #757575; } p { margin: 4px 0; } .lines-table { width: 100%; margin-bottom: 16px; } .totals { text-align: right; } .totals div { margin: 4px 0; } .total-row { font-size: 18px; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 8px; } .note { margin-top: 16px; color: #616161; }`],
})
export class QuotationDetailComponent implements OnInit {
  qt?: Quotation;
  lineCols = ['description', 'qty', 'unitPrice', 'vatRate', 'amount'];

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.api.get<Quotation>(`quotations/${this.route.snapshot.params['id']}`).subscribe(d => this.qt = d); }

  updateStatus(status: string) {
    this.api.patch(`quotations/${this.qt?.id}/status`, { status }).subscribe({ next: () => this.load(), error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }

  convertToInvoice() {
    this.api.post(`quotations/${this.qt?.id}/convert-invoice`, {}).subscribe({
      next: () => { this.snack.open('Converted to invoice', 'OK', { duration: 2000 }); this.router.navigate(['/sales/invoices/new']); },
      error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }),
    });
  }
}
