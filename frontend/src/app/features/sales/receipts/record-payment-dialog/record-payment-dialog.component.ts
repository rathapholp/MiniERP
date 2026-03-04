import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-record-payment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Record Payment</h2>
    <mat-dialog-content>
      <p>Balance due: <strong>{{ data.balance | number:'1.2-2' }}</strong></p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="date">
          <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Method</mat-label>
          <mat-select formControlName="paymentMethod">
            <mat-option value="CASH">Cash</mat-option>
            <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
            <mat-option value="CHEQUE">Cheque</mat-option>
            <mat-option value="PROMPTPAY">PromptPay</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reference</mat-label>
          <input matInput formControlName="reference">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Record Payment</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 12px; }`],
})
export class RecordPaymentDialogComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private ref: MatDialogRef<RecordPaymentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { invoiceId: number; balance: number }) {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      amount: [data.balance, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['CASH', Validators.required],
      reference: [''],
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = { ...this.form.value, invoiceId: this.data.invoiceId, date: this.form.value.date?.toISOString?.() ?? this.form.value.date };
    this.api.post('receipts', payload).subscribe({ next: (r) => this.ref.close(r), error: (e) => alert(e.error?.message || 'Error') });
  }
}
