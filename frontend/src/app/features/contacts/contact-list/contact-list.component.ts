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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Contact } from '../../../core/models/contact.model';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Contacts" newLink="/contacts/new" newLabel="New Contact"></app-page-header>
    <mat-card>
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="search" placeholder="Name, code, tax ID...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option value="">All</mat-option>
              <mat-option value="CUSTOMER">Customer</mat-option>
              <mat-option value="SUPPLIER">Supplier</mat-option>
              <mat-option value="BOTH">Both</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="contacts">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let row">{{ row.code }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let row"><app-status-badge [status]="row.type"></app-status-badge></td>
          </ng-container>
          <ng-container matColumnDef="taxId">
            <th mat-header-cell *matHeaderCellDef>Tax ID</th>
            <td mat-cell *matCellDef="let row">{{ row.taxId }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let row">{{ row.phone }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row" class="mat-column-actions">
              <a mat-icon-button [routerLink]="['/contacts', row.id, 'edit']"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button color="warn" (click)="delete(row)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p *ngIf="contacts.length === 0" style="text-align:center;color:#757575;padding:32px">No contacts found</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.filters { display: flex; gap: 16px; margin-bottom: 16px; }`],
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  columns = ['code', 'name', 'type', 'taxId', 'phone', 'actions'];
  search = new FormControl('');
  typeFilter = new FormControl('');

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.load());
    this.typeFilter.valueChanges.subscribe(() => this.load());
  }

  load() {
    this.api.get<Contact[]>('contacts', { search: this.search.value, type: this.typeFilter.value }).subscribe(d => this.contacts = d);
  }

  delete(c: Contact) {
    if (!confirm(`Delete ${c.name}?`)) return;
    this.api.delete(`contacts/${c.id}`).subscribe({ next: () => { this.snack.open('Deleted', 'OK', { duration: 2000 }); this.load(); }, error: () => this.snack.open('Cannot delete', 'OK', { duration: 3000 }) });
  }
}
