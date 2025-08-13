import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './core/frame/navbar/navbar.component';
import { FooterComponent } from "./core/frame/footer/footer.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavComponent } from './core/frame/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    SidenavComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'OIT.Web';

  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onNavigation(route: string) {
    console.log('Navigating to:', route);
    // Implementa la navigazione qui
    // this.router.navigate([route]);
    this.sidebarOpen = false;
  }

}