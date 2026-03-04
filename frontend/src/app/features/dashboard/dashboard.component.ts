import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatIconModule, MatButtonModule, StatusBadgeComponent, ThbPipe],
  template: `
    <h1>Dashboard</h1>
    <div class="summary-cards">
      <mat-card class="summary-card">
        <mat-card-content>
          <div class="card-icon blue"><mat-icon>account_balance_wallet</mat-icon></div>
          <div class="card-info">
            <div class="card-label">Total Receivable</div>
            <div class="card-value">{{ data?.totalReceivable | thb }}</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content>
          <div class="card-icon red"><mat-icon>credit_card</mat-icon></div>
          <div class="card-info">
            <div class="card-label">Total Payable</div>
            <div class="card-value">{{ data?.totalPayable | thb }}</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content>
          <div class="card-icon green"><mat-icon>trending_up</mat-icon></div>
          <div class="card-info">
            <div class="card-label">Monthly Revenue</div>
            <div class="card-value">{{ data?.monthlyRevenue | thb }}</div>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content>
          <div class="card-icon orange"><mat-icon>warning</mat-icon></div>
          <div class="card-info">
            <div class="card-label">Overdue Invoices</div>
            <div class="card-value">{{ data?.overdueCount ?? 0 }}</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="tables-row">
      <mat-card class="half-card">
        <mat-card-header>
          <mat-card-title>Recent Invoices</mat-card-title>
          <a mat-button routerLink="/sales/invoices">View All</a>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="data?.recentInvoices ?? []">
            <ng-container matColumnDef="number">
              <th mat-header-cell *matHeaderCellDef>Number</th>
              <td mat-cell *matCellDef="let row">
                <a [routerLink]="['/sales/invoices', row.id]">{{ row.number }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let row">{{ row.contact?.name }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let row" class="number-col">{{ row.total | thb }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row"><app-status-badge [status]="row.status"></app-status-badge></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="invoiceCols"></tr>
            <tr mat-row *matRowDef="let row; columns: invoiceCols;" class="clickable-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card class="half-card">
        <mat-card-header>
          <mat-card-title>Recent Bills</mat-card-title>
          <a mat-button routerLink="/purchases/bills">View All</a>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="data?.recentBills ?? []">
            <ng-container matColumnDef="number">
              <th mat-header-cell *matHeaderCellDef>Number</th>
              <td mat-cell *matCellDef="let row">
                <a [routerLink]="['/purchases/bills', row.id]">{{ row.number }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let row">{{ row.contact?.name }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let row" class="number-col">{{ row.total | thb }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row"><app-status-badge [status]="row.status"></app-status-badge></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="billCols"></tr>
            <tr mat-row *matRowDef="let row; columns: billCols;" class="clickable-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 24px; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    mat-card-content { display: flex; align-items: center; gap: 16px; }
    .card-icon { padding: 12px; border-radius: 8px; }
    .card-icon mat-icon { font-size: 32px; width: 32px; height: 32px; color: #fff; }
    .blue { background: #1565c0; } .red { background: #c62828; }
    .green { background: #2e7d32; } .orange { background: #e65100; }
    .card-label { font-size: 12px; color: #757575; }
    .card-value { font-size: 22px; font-weight: 500; }
    .tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .half-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    @media(max-width:900px) { .summary-cards { grid-template-columns: 1fr 1fr; } .tables-row { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {
  data: any;
  invoiceCols = ['number', 'contact', 'total', 'status'];
  billCols = ['number', 'contact', 'total', 'status'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('reports/dashboard').subscribe(d => this.data = d);
  }
}
