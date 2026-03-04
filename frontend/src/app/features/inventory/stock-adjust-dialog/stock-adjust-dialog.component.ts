import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-stock-adjust-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Adjust Stock — {{ data.name }}</h2>
    <mat-dialog-content>
      <p>Current Stock: <strong>{{ data.stockQty }} {{ data.unit }}</strong></p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adjustment Qty (+ or -)</mat-label>
          <input matInput type="number" formControlName="qty">
          <mat-hint>Positive to add, negative to reduce</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Note</mat-label>
          <input matInput formControlName="note">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Adjust</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 16px; }`],
})
export class StockAdjustDialogComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private ref: MatDialogRef<StockAdjustDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({ qty: [null, [Validators.required]], note: [''] });
  }

  save() {
    if (this.form.invalid) return;
    this.api.post('inventory/adjust', { productId: this.data.id, qty: this.form.value.qty, note: this.form.value.note }).subscribe({ next: (r) => this.ref.close(r), error: (e) => alert(e.error?.message || 'Error') });
  }
}
