import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../../core/services/api.service';
import { Bill } from '../../../../core/models/document.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { ThbPipe } from '../../../../shared/pipes/thb.pipe';

@Component({
  selector: 'app-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatMenuModule, MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, PageHeaderComponent, StatusBadgeComponent, ThbPipe],
  template: `
    <app-page-header [title]="'Bill ' + (bill?.number || '')">
      <app-status-badge [status]="bill?.status || ''"></app-status-badge>
      <button mat-raised-button color="primary" (click)="showPayForm = true" [disabled]="bill?.status === 'PAID' || bill?.status === 'CANCELLED'">Pay</button>
    </app-page-header>
    <mat-card *ngIf="bill">
      <mat-card-content>
        <div class="info-grid">
          <div><label>Supplier</label><p>{{ bill.contact?.name }}</p></div>
          <div><label>Date</label><p>{{ bill.date | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Due Date</label><p>{{ bill.dueDate | date:'dd/MM/yyyy' }}</p></div>
          <div><label>Paid</label><p>{{ bill.paidAmount | thb }}</p></div>
          <div><label>Balance</label><p>{{ (bill.total - bill.paidAmount) | thb }}</p></div>
        </div>
        <table mat-table [dataSource]="bill.lines || []">
          <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description }}</td></ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="number-col">Qty</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.qty }}</td></ng-container>
          <ng-container matColumnDef="unitPrice"><th mat-header-cell *matHeaderCellDef class="number-col">Price</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.unitPrice | thb }}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="number-col">Amount</th><td mat-cell *matCellDef="let r" class="number-col">{{ r.amount | thb }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div class="totals">
          <div>Subtotal: {{ bill.subtotal | thb }}</div>
          <div>VAT: {{ bill.vatAmount | thb }}</div>
          <div class="total-row">Total: {{ bill.total | thb }}</div>
        </div>
      </mat-card-content>
    </mat-card>
    <mat-card *ngIf="showPayForm" style="margin-top:16px">
      <mat-card-header><mat-card-title>Record Payment</mat-card-title></mat-card-header>
      <mat-card-content>
        <form [formGroup]="payForm" (ngSubmit)="submitPayment()">
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Date</mat-label><input matInput [matDatepicker]="dp" formControlName="date"><mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle><mat-datepicker #dp></mat-datepicker></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Amount</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Method</mat-label>
              <mat-select formControlName="paymentMethod">
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                <mat-option value="CHEQUE">Cheque</mat-option>
                <mat-option value="PROMPTPAY">PromptPay</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" (click)="showPayForm = false">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="payForm.invalid">Submit Payment</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.info-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; } label { font-size: 12px; color: #757575; } p { margin: 4px 0; } .totals { text-align: right; margin-top: 16px; } .totals div { margin: 4px 0; } .total-row { font-size: 18px; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 8px; } .form-row { display: flex; gap: 16px; } .form-row mat-form-field { flex: 1; } .form-actions { display: flex; justify-content: flex-end; gap: 8px; }`],
})
export class BillDetailComponent implements OnInit {
  bill?: Bill;
  cols = ['description', 'qty', 'unitPrice', 'amount'];
  showPayForm = false;
  payForm: FormGroup;

  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.payForm = this.fb.group({ date: [new Date(), Validators.required], amount: [null, [Validators.required, Validators.min(0.01)]], paymentMethod: ['CASH', Validators.required] });
  }

  ngOnInit() { this.load(); }

  load() { this.api.get<Bill>(`bills/${this.route.snapshot.params['id']}`).subscribe(d => { this.bill = d; this.payForm.patchValue({ amount: Number(d.total) - Number(d.paidAmount) }); }); }

  submitPayment() {
    if (this.payForm.invalid) return;
    const payload = { ...this.payForm.value, date: this.payForm.value.date?.toISOString?.() ?? this.payForm.value.date };
    this.api.post(`bills/${this.bill?.id}/pay`, payload).subscribe({ next: () => { this.snack.open('Payment recorded', 'OK', { duration: 2000 }); this.showPayForm = false; this.load(); }, error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
