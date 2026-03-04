import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Contact' : 'New Contact'"></app-page-header>
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Code *</mat-label>
              <input matInput formControlName="code">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type *</mat-label>
              <mat-select formControlName="type">
                <mat-option value="CUSTOMER">Customer</mat-option>
                <mat-option value="SUPPLIER">Supplier</mat-option>
                <mat-option value="BOTH">Both</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name *</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Tax ID</mat-label>
              <input matInput formControlName="taxId">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <textarea matInput formControlName="address" rows="3"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-button type="button" routerLink="/contacts">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.form-row { display: flex; gap: 16px; } .form-row mat-form-field { flex: 1; } .full-width { width: 100%; } .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }`],
})
export class ContactFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private route: ActivatedRoute, private snack: MatSnackBar) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['CUSTOMER', Validators.required],
      taxId: [''],
      phone: [''],
      email: [''],
      address: [''],
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isEdit = !!this.id;
    if (this.isEdit) {
      this.api.get<any>(`contacts/${this.id}`).subscribe(d => this.form.patchValue(d));
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const obs = this.isEdit ? this.api.put(`contacts/${this.id}`, this.form.value) : this.api.post('contacts', this.form.value);
    obs.subscribe({ next: () => { this.snack.open('Saved', 'OK', { duration: 2000 }); this.router.navigate(['/contacts']); }, error: (e) => this.snack.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }
}
