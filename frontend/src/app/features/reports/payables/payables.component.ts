import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-payables',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header title="Payables"></app-page-header>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Bill</th><td mat-cell *matCellDef="let r"><a [routerLink]="['/purchases/bills', r.id]">{{ r.number }}</a></td></ng-container>
          <ng-container matColumnDef="contact"><th mat-header-cell *matHeaderCellDef>Supplier</th><td mat-cell *matCellDef="let r">{{ r.contact?.name }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="dueDate"><th mat-header-cell *matHeaderCellDef>Due</th><td mat-cell *matCellDef="let r">{{ r.dueDate | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="number-col">Total</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.total | thb }}</td></ng-container>
          <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef class="number-col">Paid</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.paidAmount | thb }}</td></ng-container>
          <ng-container matColumnDef="balance"><th mat-header-cell *matHeaderCellDef class="number-col">Balance</th><td mat-cell *matCellDef="let r" class="number-col">{{ (r.total - r.paidAmount) | thb }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div *ngIf="total" class="grand-total">Total Outstanding: <strong>{{ total | thb }}</strong></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.grand-total { text-align: right; margin-top: 16px; font-size: 16px; }`],
})
export class PayablesComponent implements OnInit {
  items: any[] = [];
  cols = ['number', 'contact', 'date', 'dueDate', 'total', 'paid', 'balance', 'status'];
  total = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('reports/payables').subscribe(d => {
      this.items = d;
      this.total = d.reduce((s, b) => s + (Number(b.total) - Number(b.paidAmount)), 0);
    });
  }
}
