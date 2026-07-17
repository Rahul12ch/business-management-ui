import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {

  @Input() collapsed = true;
  @Output() requestClose = new EventEmitter<void>();

  isMobile = window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() { this.isMobile = window.innerWidth <= 768; }

  onLinkClick() {
    if (this.isMobile) {
      this.requestClose.emit();
    }
  }

}