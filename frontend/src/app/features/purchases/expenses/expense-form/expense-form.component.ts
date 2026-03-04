import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, PageHeaderComponent],
  template: `
    <app-page-header title="New Expense"></app-page-header>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date *</mat-label>
              <input matInput [matDatepicker]="dp" formControlName="date">
              <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
              <mat-datepicker #dp></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option [value]="null">None</mat-option>
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Payment Method</mat-label>
              <mat-select formControlName="paymentMethod">
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                <mat-option value="CHEQUE">Cheque</mat-option>
                <mat-option value="PROMPTPAY">PromptPay</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description *</mat-label>
            <input matInput formControlName="description">
          </mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Amount *</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>VAT Amount</mat-label><input matInput type="number" formControlName="vatAmount"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Reference</mat-label><input matInput formControlName="reference"></mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" routerLink="/purchases/expenses">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.form-row { display: flex; gap: 16px; } .form-row mat-form-field { flex: 1; } .full-width { width: 100%; margin-bottom: 16px; } .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }`],
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;
  categories: any[] = [];

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({ date: [new Date(), Validators.required], categoryId: [null], description: ['', Validators.required], amount: [0, [Validators.required, Validators.min(0)]], vatAmount: [0], paymentMethod: [null], reference: [''] });
  }

  ngOnInit() { this.api.get<any[]>('expenses/categories').subscribe(c => this.categories = c); }

  onSubmit() {
    if (this.form.invalid) return;
    const payload = { ...this.form.value, date: this.form.value.date?.toISOString?.() ?? this.form.value.date };
    this.api.post('expenses', payload).subscribe({ next: () => { this.snack.open('Saved', 'OK', { duration: 2000 }); this.router.navigate(['/purchases/expenses']); }, error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
