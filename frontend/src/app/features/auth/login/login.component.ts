import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>MiniERP</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@demo.com">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
            </mat-form-field>
            <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              Sign In
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex; align-items: center; justify-content: center;
      height: 100vh; background: #f5f5f5;
    }
    .login-card { width: 400px; padding: 16px; }
    mat-card-header { margin-bottom: 24px; }
    mat-card-title { font-size: 28px !important; color: #3f51b5; }
    .full-width { width: 100%; margin-bottom: 16px; }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email: ['admin@demo.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        this.snack.open(err.error?.message || 'Login failed', 'Close', { duration: 3000 });
      },
    });
  }
}
