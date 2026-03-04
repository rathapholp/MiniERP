import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'thb', standalone: true })
export class ThbPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  }
}
