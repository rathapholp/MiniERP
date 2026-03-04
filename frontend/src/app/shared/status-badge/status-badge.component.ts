import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-chip" [ngClass]="status?.toLowerCase()">{{ status }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';
}
