import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Profit & Loss Report"></app-page-header>
    <mat-card style="margin-bottom:16px">
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="dp1" [formControl]="startDate">
            <mat-datepicker-toggle matSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="dp2" [formControl]="endDate">
            <mat-datepicker-toggle matSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="load()">Generate</button>
        </div>
      </mat-card-content>
    </mat-card>
    <mat-card *ngIf="data">
      <mat-card-content>
        <table class="pl-table">
          <tr><td>Revenue</td><td class="number-col">{{ data.totalRevenue | thb }}</td></tr>
          <tr class="sub"><td>Cost of Goods Sold (COGS)</td><td class="number-col">{{ data.cogs | thb }}</td></tr>
          <tr class="bold"><td>Gross Profit</td><td class="number-col">{{ data.grossProfit | thb }}</td></tr>
          <tr class="sub"><td>Operating Expenses</td><td class="number-col">{{ data.totalExpenses | thb }}</td></tr>
          <tr class="total"><td>Net Profit</td><td class="number-col" [style.color]="data.netProfit < 0 ? '#c62828' : '#2e7d32'">{{ data.netProfit | thb }}</td></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.filters { display: flex; gap: 16px; align-items: flex-start; } .pl-table { width: 100%; border-collapse: collapse; } .pl-table tr { border-bottom: 1px solid #f0f0f0; } .pl-table td { padding: 12px 8px; } .pl-table .sub td { color: #757575; padding-left: 24px; } .pl-table .bold td { font-weight: 500; } .pl-table .total td { font-size: 18px; font-weight: 600; border-top: 2px solid #e0e0e0; } .number-col { text-align: right; }`],
})
export class ProfitLossComponent {
  startDate = new FormControl(new Date(new Date().getFullYear(), 0, 1));
  endDate = new FormControl(new Date());
  data: any;

  constructor(private api: ApiService) {}

  load() {
    const start = this.startDate.value?.toISOString?.() ?? this.startDate.value;
    const end = this.endDate.value?.toISOString?.() ?? this.endDate.value;
    this.api.get<any>('reports/profit-loss', { startDate: start, endDate: end }).subscribe(d => this.data = d);
  }
}
