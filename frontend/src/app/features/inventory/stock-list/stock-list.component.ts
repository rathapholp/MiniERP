import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../shared/pipes/thb.pipe';
import { debounceTime } from 'rxjs';
import { StockAdjustDialogComponent } from '../stock-adjust-dialog/stock-adjust-dialog.component';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Inventory">
      <a mat-stroked-button routerLink="/inventory/movements"><mat-icon>history</mat-icon> Movements</a>
    </app-page-header>
    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" style="margin-bottom:16px">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="search" placeholder="Code or name...">
        </mat-form-field>
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.code }}</td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category?.name }}</td></ng-container>
          <ng-container matColumnDef="stockQty"><th mat-header-cell *matHeaderCellDef class="number-col">Stock</th><td mat-cell *matCellDef="let r" class="number-col" [style.color]="r.stockQty <= 5 ? '#c62828' : 'inherit'">{{ r.stockQty }} {{ r.unit }}</td></ng-container>
          <ng-container matColumnDef="costPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Cost Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.costPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-stroked-button (click)="openAdjust(r)"><mat-icon>tune</mat-icon> Adjust</button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class StockListComponent implements OnInit {
  items: any[] = [];
  columns = ['code', 'name', 'category', 'stockQty', 'costPrice', 'actions'];
  search = new FormControl('');

  constructor(private api: ApiService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300)).subscribe(() => this.load());
  }

  load() { this.api.get<any[]>('inventory', { search: this.search.value }).subscribe(d => this.items = d); }

  openAdjust(product: any) {
    const ref = this.dialog.open(StockAdjustDialogComponent, { width: '400px', data: product });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Stock adjusted', 'OK', { duration: 2000 }); this.load(); } });
  }
}
