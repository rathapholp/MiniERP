import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../../core/services/api.service';
import { Receipt } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Receipts"></app-page-header>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Number</th><td mat-cell *matCellDef="let r">{{ r.number }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="invoice"><th mat-header-cell *matHeaderCellDef>Invoice</th><td mat-cell *matCellDef="let r"><a [routerLink]="['/sales/invoices', r.invoiceId]">{{ r.invoice?.number }}</a></td></ng-container>
          <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef>Customer</th><td mat-cell *matCellDef="let r">{{ r.invoice?.contact?.name }}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
          <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th><td mat-cell *matCellDef="let r">{{ r.paymentMethod }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class ReceiptListComponent implements OnInit {
  items: any[] = [];
  columns = ['number', 'date', 'invoice', 'customer', 'amount', 'method'];

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('receipts').subscribe(d => this.items = d); }
}
