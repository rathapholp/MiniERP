import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <span mat-menu-item disabled>{{ auth.currentUser()?.name }}</span>
        <button mat-menu-item (click)="auth.logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`.spacer { flex: 1 1 auto; }`],
})
export class TopbarComponent {
  constructor(public auth: AuthService) {}
}
