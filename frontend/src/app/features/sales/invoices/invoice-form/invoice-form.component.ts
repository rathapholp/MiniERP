import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { Contact } from '../../../../core/models/contact.model';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { DocumentLineEditorComponent } from '../../../../shared/document-line-editor/document-line-editor.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, PageHeaderComponent, DocumentLineEditorComponent],
  template: `
    <app-page-header title="New Invoice"></app-page-header>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Customer *</mat-label>
              <mat-select formControlName="contactId">
                <mat-option *ngFor="let c of contacts" [value]="c.id">{{ c.code }} - {{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date *</mat-label>
              <input matInput [matDatepicker]="dp1" formControlName="date">
              <mat-datepicker-toggle matSuffix [for]="dp1"></mat-datepicker-toggle>
              <mat-datepicker #dp1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="dp2" formControlName="dueDate">
              <mat-datepicker-toggle matSuffix [for]="dp2"></mat-datepicker-toggle>
              <mat-datepicker #dp2></mat-datepicker>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Note</mat-label>
            <textarea matInput formControlName="note" rows="2"></textarea>
          </mat-form-field>
          <app-document-line-editor [linesArray]="linesArray" (totalsChanged)="onTotals($event)"></app-document-line-editor>
          <div class="form-actions">
            <button mat-button type="button" routerLink="/sales/invoices">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || linesArray.length === 0">Create Invoice</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.form-row { display: flex; gap: 16px; } .form-row mat-form-field { flex: 1; } .full-width { width: 100%; } .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }`],
})
export class InvoiceFormComponent implements OnInit {
  form: FormGroup;
  linesArray: FormArray;
  contacts: Contact[] = [];

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private snack: MatSnackBar) {
    this.linesArray = this.fb.array([]);
    this.form = this.fb.group({ contactId: [null, Validators.required], date: [new Date(), Validators.required], dueDate: [null], note: [''] });
  }

  ngOnInit() { this.api.get<Contact[]>('contacts', { type: 'CUSTOMER' }).subscribe(c => this.contacts = c); }
  onTotals(t: any) {}

  onSubmit() {
    if (this.form.invalid || this.linesArray.length === 0) return;
    const lines = this.linesArray.value.map((l: any) => ({ productId: l.productId || undefined, description: l.description, qty: l.qty, unitPrice: l.unitPrice, vatRate: l.vatRate }));
    const payload = { ...this.form.value, date: this.form.value.date?.toISOString?.() ?? this.form.value.date, dueDate: this.form.value.dueDate?.toISOString?.() ?? this.form.value.dueDate, lines };
    this.api.post('invoices', payload).subscribe({ next: () => { this.snack.open('Invoice created', 'OK', { duration: 2000 }); this.router.navigate(['/sales/invoices']); }, error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
