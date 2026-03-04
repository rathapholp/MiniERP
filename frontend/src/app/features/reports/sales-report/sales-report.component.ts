import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatDatepickerModule, MatNativeDateModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header title="Sales Report"></app-page-header>
    <mat-card style="margin-bottom:16px">
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>Start Date</mat-label><input matInput [matDatepicker]="dp1" [formControl]="startDate"><mat-datepicker-toggle matSuffix [for]="dp1"></mat-datepicker-toggle><mat-datepicker #dp1></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>End Date</mat-label><input matInput [matDatepicker]="dp2" [formControl]="endDate"><mat-datepicker-toggle matSuffix [for]="dp2"></mat-datepicker-toggle><mat-datepicker #dp2></mat-datepicker></mat-form-field>
          <button mat-raised-button color="primary" (click)="load()">Generate</button>
        </div>
      </mat-card-content>
    </mat-card>
    <div *ngIf="data" class="summary-cards">
      <mat-card><mat-card-content><div class="label">Invoices</div><div class="val">{{ data.summary?._count }}</div></mat-card-content></mat-card>
      <mat-card><mat-card-content><div class="label">Subtotal</div><div class="val">{{ data.summary?._sum?.subtotal | thb }}</div></mat-card-content></mat-card>
      <mat-card><mat-card-content><div class="label">VAT</div><div class="val">{{ data.summary?._sum?.vatAmount | thb }}</div></mat-card-content></mat-card>
      <mat-card><mat-card-content><div class="label">Total</div><div class="val">{{ data.summary?._sum?.total | thb }}</div></mat-card-content></mat-card>
    </div>
    <mat-card *ngIf="data">
      <mat-card-content>
        <table mat-table [dataSource]="data.invoices || []">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Invoice</th><td mat-cell *matCellDef="let r"><a [routerLink]="['/sales/invoices', r.id]">{{ r.number }}</a></td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="contact"><th mat-header-cell *matHeaderCellDef>Customer</th><td mat-cell *matCellDef="let r">{{ r.contact?.name }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="number-col">Total</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.total | thb }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.filters { display: flex; gap: 16px; align-items: flex-start; } .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; } .label { font-size: 12px; color: #757575; } .val { font-size: 20px; font-weight: 500; }`],
})
export class SalesReportComponent {
  startDate = new FormControl(new Date(new Date().getFullYear(), 0, 1));
  endDate = new FormControl(new Date());
  data: any;
  cols = ['number', 'date', 'contact', 'total', 'status'];

  constructor(private api: ApiService) {}

  load() {
    const start = this.startDate.value?.toISOString?.() ?? this.startDate.value;
    const end = this.endDate.value?.toISOString?.() ?? this.endDate.value;
    this.api.get<any>('reports/sales-summary', { startDate: start, endDate: end }).subscribe(d => this.data = d);
  }
}
