import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {

  isMobile = window.innerWidth <= 768;
  sidebarCollapsed = this.isMobile;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => { if (this.isMobile) { this.sidebarCollapsed = true;
        }});
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeSidebar() {
    this.sidebarCollapsed = true;
  }
}