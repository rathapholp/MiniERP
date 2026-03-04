import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { ThbPipe } from '../pipes/thb.pipe';
import { debounceTime, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-document-line-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatAutocompleteModule,
    ThbPipe,
  ],
  template: `
    <div class="line-editor">
      <table mat-table [dataSource]="linesArray.controls" class="lines-table">
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let line; let i = index" [formGroup]="getGroup(i)">
            <mat-form-field appearance="outline" class="full-width">
              <input matInput formControlName="description" placeholder="Item description"
                     [matAutocomplete]="auto"
                     (input)="searchProducts($event, i)">
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onProductSelect($event, i)">
                <mat-option *ngFor="let p of filteredProducts" [value]="p.name" [attr.data-product]="p | json">
                  {{ p.code }} - {{ p.name }} ({{ p.unit }})
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="qty">
          <th mat-header-cell *matHeaderCellDef>Qty</th>
          <td mat-cell *matCellDef="let line; let i = index" [formGroup]="getGroup(i)">
            <mat-form-field appearance="outline" style="width:90px">
              <input matInput type="number" formControlName="qty" (change)="recalc(i)">
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="unit">
          <th mat-header-cell *matHeaderCellDef>Unit</th>
          <td mat-cell *matCellDef="let line; let i = index" [formGroup]="getGroup(i)">
            <mat-form-field appearance="outline" style="width:70px">
              <input matInput formControlName="unit">
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="unitPrice">
          <th mat-header-cell *matHeaderCellDef>Unit Price</th>
          <td mat-cell *matCellDef="let line; let i = index" [formGroup]="getGroup(i)">
            <mat-form-field appearance="outline" style="width:110px">
              <input matInput type="number" formControlName="unitPrice" (change)="recalc(i)">
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="vatRate">
          <th mat-header-cell *matHeaderCellDef>VAT%</th>
          <td mat-cell *matCellDef="let line; let i = index" [formGroup]="getGroup(i)">
            <mat-form-field appearance="outline" style="width:70px">
              <input matInput type="number" formControlName="vatRate" (change)="recalc(i)">
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef class="number-col">Amount</th>
          <td mat-cell *matCellDef="let line; let i = index" class="number-col">
            {{ getGroup(i).get('amount')?.value | thb }}
          </td>
        </ng-container>
        <ng-container matColumnDef="remove">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let line; let i = index">
            <button mat-icon-button color="warn" (click)="removeLine(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <button mat-button color="primary" (click)="addLine()" type="button">
        <mat-icon>add</mat-icon> Add Line
      </button>
      <div class="totals">
        <div>Subtotal: <strong>{{ subtotal | thb }}</strong></div>
        <div>VAT: <strong>{{ vatAmount | thb }}</strong></div>
        <div class="total-row">Total: <strong>{{ total | thb }}</strong></div>
      </div>
    </div>
  `,
  styles: [`
    .line-editor { margin-top: 16px; }
    .lines-table { width: 100%; margin-bottom: 16px; }
    .totals { text-align: right; padding: 8px 0; }
    .totals div { margin: 4px 0; }
    .total-row { font-size: 18px; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 8px; }
  `],
})
export class DocumentLineEditorComponent implements OnInit {
  @Input() linesArray!: FormArray;
  @Output() totalsChanged = new EventEmitter<{ subtotal: number; vatAmount: number; total: number }>();

  columns = ['description', 'qty', 'unit', 'unitPrice', 'vatRate', 'amount', 'remove'];
  filteredProducts: Product[] = [];
  subtotal = 0;
  vatAmount = 0;
  total = 0;

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() { this.recalcTotals(); }

  createLineGroup(data?: any): FormGroup {
    return this.fb.group({
      productId: [data?.productId ?? null],
      description: [data?.description ?? '', Validators.required],
      qty: [data?.qty ?? 1, [Validators.required, Validators.min(0)]],
      unit: [data?.unit ?? 'pcs'],
      unitPrice: [data?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      vatRate: [data?.vatRate ?? 7, [Validators.required, Validators.min(0)]],
      vatAmount: [data?.vatAmount ?? 0],
      amount: [data?.amount ?? 0],
    });
  }

  addLine() {
    this.linesArray.push(this.createLineGroup());
  }

  removeLine(i: number) {
    this.linesArray.removeAt(i);
    this.recalcTotals();
  }

  getGroup(i: number): FormGroup {
    return this.linesArray.at(i) as FormGroup;
  }

  recalc(i: number) {
    const g = this.getGroup(i);
    const qty = Number(g.get('qty')?.value) || 0;
    const unitPrice = Number(g.get('unitPrice')?.value) || 0;
    const vatRate = Number(g.get('vatRate')?.value) || 0;
    const lineSubtotal = qty * unitPrice;
    const lineVat = lineSubtotal * (vatRate / 100);
    g.patchValue({ vatAmount: lineVat, amount: lineSubtotal + lineVat }, { emitEvent: false });
    this.recalcTotals();
  }

  recalcTotals() {
    let sub = 0, vat = 0;
    this.linesArray.controls.forEach((_, i) => {
      const g = this.getGroup(i);
      const qty = Number(g.get('qty')?.value) || 0;
      const unitPrice = Number(g.get('unitPrice')?.value) || 0;
      const vatRate = Number(g.get('vatRate')?.value) || 0;
      sub += qty * unitPrice;
      vat += qty * unitPrice * (vatRate / 100);
    });
    this.subtotal = sub;
    this.vatAmount = vat;
    this.total = sub + vat;
    this.totalsChanged.emit({ subtotal: this.subtotal, vatAmount: this.vatAmount, total: this.total });
  }

  searchProducts(event: Event, idx: number) {
    const val = (event.target as HTMLInputElement).value;
    if (val.length < 2) { this.filteredProducts = []; return; }
    this.api.get<Product[]>('products', { search: val }).subscribe(p => this.filteredProducts = p);
  }

  onProductSelect(event: any, i: number) {
    const productJson = event.option.getHostElement().getAttribute('data-product');
    if (!productJson) return;
    const product: Product = JSON.parse(productJson);
    this.getGroup(i).patchValue({
      productId: product.id,
      description: product.name,
      unitPrice: product.sellPrice,
      vatRate: product.vatRate,
      unit: product.unit,
    });
    this.recalc(i);
  }
}
