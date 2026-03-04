import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>{{ title }}</h1>
      <div class="header-actions">
        <ng-content></ng-content>
        <a *ngIf="newLink" mat-raised-button color="primary" [routerLink]="newLink">
          <mat-icon>add</mat-icon> {{ newLabel || 'New' }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() newLink?: string;
  @Input() newLabel?: string;
}
