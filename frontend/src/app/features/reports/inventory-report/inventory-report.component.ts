import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Inventory Valuation Report"></app-page-header>
    <mat-card style="margin-bottom:16px" *ngIf="data">
      <mat-card-content>
        <div style="display:flex;gap:32px">
          <div><div style="font-size:12px;color:#757575">Total Items</div><div style="font-size:24px;font-weight:500">{{ data.items?.length }}</div></div>
          <div><div style="font-size:12px;color:#757575">Total Inventory Value</div><div style="font-size:24px;font-weight:500;color:#1565c0">{{ data.totalValue | thb }}</div></div>
        </div>
      </mat-card-content>
    </mat-card>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="data?.items || []">
          <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.code }}</td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category?.name }}</td></ng-container>
          <ng-container matColumnDef="stockQty"><th mat-header-cell *matHeaderCellDef class="number-col">Stock</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.stockQty }} {{ r.unit }}</td></ng-container>
          <ng-container matColumnDef="costPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Cost Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.costPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef class="number-col">Stock Value</th><td mat-cell *matCellDef="let r" class="number-col"><strong>{{ r.stockValue | thb }}</strong></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class InventoryReportComponent implements OnInit {
  data: any;
  cols = ['code', 'name', 'category', 'stockQty', 'costPrice', 'value'];

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any>('reports/inventory-value').subscribe(d => this.data = d); }
}
