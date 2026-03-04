import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../../core/services/api.service';
import { Expense } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, PageHeaderComponent, ThbPipe],
  template: `
    <app-page-header title="Expenses" newLink="/purchases/expenses/new" newLabel="New Expense"></app-page-header>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="items">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Number</th><td mat-cell *matCellDef="let r">{{ r.number }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.date | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category?.name }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="number-col">Total</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.total | thb }}</td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r"><button mat-icon-button color="warn" (click)="delete(r)"><mat-icon>delete</mat-icon></button></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class ExpenseListComponent implements OnInit {
  items: Expense[] = [];
  columns = ['number', 'date', 'description', 'category', 'total', 'actions'];

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<Expense[]>('expenses').subscribe(d => this.items = d); }
  delete(e: Expense) { if (!confirm(`Delete ${e.number}?`)) return; this.api.delete(`expenses/${e.id}`).subscribe(() => this.load()); }
}
