import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, TopbarComponent],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <app-sidebar></app-sidebar>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <app-topbar></app-topbar>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #fff; border-right: 1px solid #e0e0e0; }
    .main-content { display: flex; flex-direction: column; height: 100%; }
    .content-area { flex: 1; overflow-y: auto; padding: 24px; background: #f5f5f5; }
  `],
})
export class ShellComponent {}
