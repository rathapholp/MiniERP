import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'contacts',
        loadComponent: () => import('./features/contacts/contact-list/contact-list.component').then(m => m.ContactListComponent),
      },
      {
        path: 'contacts/new',
        loadComponent: () => import('./features/contacts/contact-form/contact-form.component').then(m => m.ContactFormComponent),
      },
      {
        path: 'contacts/:id/edit',
        loadComponent: () => import('./features/contacts/contact-form/contact-form.component').then(m => m.ContactFormComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/stock-list/stock-list.component').then(m => m.StockListComponent),
      },
      {
        path: 'inventory/movements',
        loadComponent: () => import('./features/inventory/stock-movements/stock-movements.component').then(m => m.StockMovementsComponent),
      },
      {
        path: 'sales/quotations',
        loadComponent: () => import('./features/sales/quotations/quotation-list/quotation-list.component').then(m => m.QuotationListComponent),
      },
      {
        path: 'sales/quotations/new',
        loadComponent: () => import('./features/sales/quotations/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent),
      },
      {
        path: 'sales/quotations/:id',
        loadComponent: () => import('./features/sales/quotations/quotation-detail/quotation-detail.component').then(m => m.QuotationDetailComponent),
      },
      {
        path: 'sales/invoices',
        loadComponent: () => import('./features/sales/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
      },
      {
        path: 'sales/invoices/new',
        loadComponent: () => import('./features/sales/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
      },
      {
        path: 'sales/invoices/:id',
        loadComponent: () => import('./features/sales/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
      },
      {
        path: 'sales/receipts',
        loadComponent: () => import('./features/sales/receipts/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
      },
      {
        path: 'purchases/orders',
        loadComponent: () => import('./features/purchases/purchase-orders/po-list/po-list.component').then(m => m.PoListComponent),
      },
      {
        path: 'purchases/orders/new',
        loadComponent: () => import('./features/purchases/purchase-orders/po-form/po-form.component').then(m => m.PoFormComponent),
      },
      {
        path: 'purchases/orders/:id',
        loadComponent: () => import('./features/purchases/purchase-orders/po-detail/po-detail.component').then(m => m.PoDetailComponent),
      },
      {
        path: 'purchases/bills',
        loadComponent: () => import('./features/purchases/bills/bill-list/bill-list.component').then(m => m.BillListComponent),
      },
      {
        path: 'purchases/bills/new',
        loadComponent: () => import('./features/purchases/bills/bill-form/bill-form.component').then(m => m.BillFormComponent),
      },
      {
        path: 'purchases/bills/:id',
        loadComponent: () => import('./features/purchases/bills/bill-detail/bill-detail.component').then(m => m.BillDetailComponent),
      },
      {
        path: 'purchases/expenses',
        loadComponent: () => import('./features/purchases/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent),
      },
      {
        path: 'purchases/expenses/new',
        loadComponent: () => import('./features/purchases/expenses/expense-form/expense-form.component').then(m => m.ExpenseFormComponent),
      },
      {
        path: 'reports/profit-loss',
        loadComponent: () => import('./features/reports/profit-loss/profit-loss.component').then(m => m.ProfitLossComponent),
      },
      {
        path: 'reports/sales',
        loadComponent: () => import('./features/reports/sales-report/sales-report.component').then(m => m.SalesReportComponent),
      },
      {
        path: 'reports/receivables',
        loadComponent: () => import('./features/reports/receivables/receivables.component').then(m => m.ReceivablesComponent),
      },
      {
        path: 'reports/payables',
        loadComponent: () => import('./features/reports/payables/payables.component').then(m => m.PayablesComponent),
      },
      {
        path: 'reports/inventory',
        loadComponent: () => import('./features/reports/inventory-report/inventory-report.component').then(m => m.InventoryReportComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
