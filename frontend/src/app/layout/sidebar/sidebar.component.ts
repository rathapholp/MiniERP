import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

interface NavGroup {
  label: string;
  icon: string;
  path?: string;
  children?: { label: string; path: string }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatExpansionModule],
  template: `
    <div class="sidebar-header">
      <h2>MiniERP</h2>
    </div>
    <mat-nav-list>
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>

      <mat-expansion-panel [expanded]="isSalesActive()">
        <mat-expansion-panel-header>
          <mat-icon>receipt_long</mat-icon>&nbsp; Sales
        </mat-expansion-panel-header>
        <a mat-list-item routerLink="/sales/quotations" routerLinkActive="active-link">Quotations</a>
        <a mat-list-item routerLink="/sales/invoices" routerLinkActive="active-link">Invoices</a>
        <a mat-list-item routerLink="/sales/receipts" routerLinkActive="active-link">Receipts</a>
      </mat-expansion-panel>

      <mat-expansion-panel [expanded]="isPurchasesActive()">
        <mat-expansion-panel-header>
          <mat-icon>shopping_cart</mat-icon>&nbsp; Purchases
        </mat-expansion-panel-header>
        <a mat-list-item routerLink="/purchases/orders" routerLinkActive="active-link">Purchase Orders</a>
        <a mat-list-item routerLink="/purchases/bills" routerLinkActive="active-link">Bills</a>
        <a mat-list-item routerLink="/purchases/expenses" routerLinkActive="active-link">Expenses</a>
      </mat-expansion-panel>

      <a mat-list-item routerLink="/inventory" routerLinkActive="active-link">
        <mat-icon matListItemIcon>inventory_2</mat-icon>
        <span matListItemTitle>Inventory</span>
      </a>

      <mat-expansion-panel [expanded]="isReportsActive()">
        <mat-expansion-panel-header>
          <mat-icon>bar_chart</mat-icon>&nbsp; Reports
        </mat-expansion-panel-header>
        <a mat-list-item routerLink="/reports/profit-loss" routerLinkActive="active-link">P&L</a>
        <a mat-list-item routerLink="/reports/sales" routerLinkActive="active-link">Sales</a>
        <a mat-list-item routerLink="/reports/receivables" routerLinkActive="active-link">Receivables</a>
        <a mat-list-item routerLink="/reports/payables" routerLinkActive="active-link">Payables</a>
        <a mat-list-item routerLink="/reports/inventory" routerLinkActive="active-link">Inventory</a>
      </mat-expansion-panel>

      <a mat-list-item routerLink="/contacts" routerLinkActive="active-link">
        <mat-icon matListItemIcon>contacts</mat-icon>
        <span matListItemTitle>Contacts</span>
      </a>
      <a mat-list-item routerLink="/products" routerLinkActive="active-link">
        <mat-icon matListItemIcon>inventory</mat-icon>
        <span matListItemTitle>Products</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .sidebar-header { padding: 16px; border-bottom: 1px solid #e0e0e0; }
    .sidebar-header h2 { margin: 0; font-size: 20px; font-weight: 500; color: #3f51b5; }
    .active-link { background: rgba(63, 81, 181, 0.1) !important; color: #3f51b5 !important; }
    mat-expansion-panel { box-shadow: none !important; }
    ::ng-deep .mat-expansion-panel-body { padding: 0 !important; }
  `],
})
export class SidebarComponent {
  isSalesActive() { return window.location.pathname.includes('/sales'); }
  isPurchasesActive() { return window.location.pathname.includes('/purchases'); }
  isReportsActive() { return window.location.pathname.includes('/reports'); }
}
