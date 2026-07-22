import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../services/auth';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  username = '';
  email = '';
  profileImage = '';
  currentPage = '';

  showDropdown = false;
  showNotifications = false;

  notifications: any[] = [];
  unreadCount = 0;

  private notificationTimer?: Subscription;
  private profileUpdatedHandler = () => { this.loadUser(); };
  constructor(
    private router: Router,
    private authService: AuthService,
    private notification: Notification,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUser();
    if (this.authService.isLoggedIn()) { this.loadNotifications();
      this.notificationTimer = interval(30000).subscribe(() => { this.loadNotifications(); });
    }
    window.addEventListener('profileUpdated', this.profileUpdatedHandler);
    this.updatePageTitle(this.router.url);
    this.router.events .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navEvent = event as NavigationEnd; this.updatePageTitle(navEvent.urlAfterRedirects);
        this.loadUser(); this.closeAllMenus();
      });
  }
  ngOnDestroy(): void { document.body.classList.remove('menu-open');
    window.removeEventListener('profileUpdated', this.profileUpdatedHandler);
    this.notificationTimer?.unsubscribe();
  }

  loadUser(): void {
    if (!this.authService.isLoggedIn()) {
      this.username = ''; this.email = ''; this.profileImage = '';
      this.cdr.markForCheck();
      return;
    }
    this.authService.getProfile().subscribe({
      next: (user: any) => { this.username = user.username ?? ''; this.email = user.email ?? '';
        this.profileImage = user.profileImage ?? '';
        this.cdr.markForCheck();
      },
      error: () => { this.username = ''; this.email = ''; this.profileImage = '';
        this.cdr.markForCheck();
      }
    });
  }
  loadNotifications(): void {
    if (!this.authService.isLoggedIn()) { return; }
    this.notification.getNotifications().subscribe(data => { this.notification.getUnreadCount().subscribe(count => {
        this.notifications = data;
        this.unreadCount = count;
        this.cdr.markForCheck();
      });
    });
  }

  markAsRead(item: any): void { this.notification.markAsRead(item.notificationId).subscribe(() => {
      this.loadNotifications();
    });
  }

  markAllRead(): void { this.notification.markAllRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteNotification(item: any, event: Event): void { event.stopPropagation();
    this.notification.deleteNotification(item.notificationId).subscribe(() => {
      this.notifications = this.notifications.filter( x => x.notificationId !== item.notificationId );
      this.unreadCount = this.notifications.filter( x => !x.isRead ).length;
      this.cdr.markForCheck();
    });
  }
  clearNotifications(): void { this.notification.clearNotifications().subscribe(() => {
      this.notifications = []; this.unreadCount = 0;
      this.cdr.markForCheck();
    });
  }

updatePageTitle(url: string): void {
  if (url.includes('/dashboard')) this.currentPage = 'Dashboard';
  else if (url.includes('/home'))  this.currentPage = 'New Entry';
  else if (url.includes('/lists'))  this.currentPage = 'Tasks & Customers';
  else if (url.includes('/profile'))  this.currentPage = 'Profile';
  else  this.currentPage = 'Dashboard';
}

  toggleSidebar(): void { this.menuToggle.emit(); }
 toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) { this.showDropdown = false; document.body.classList.add('menu-open');
    } 
    else { document.body.classList.remove('menu-open'); }
}

 toggleDropdown(): void { this.showDropdown = !this.showDropdown;
    if (this.showDropdown) { this.showNotifications = false;
        document.body.classList.add('menu-open');
    } else {
        document.body.classList.remove('menu-open'); }
}

  goProfile(): void { this.closeAllMenus();
    this.router.navigate(['/profile']);
  }

  logout(): void {
     document.body.classList.remove('menu-open');
    this.closeAllMenus();
    this.notificationTimer?.unsubscribe();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeAllMenus(): void {
    this.showDropdown = false;
    this.showNotifications = false;
    document.body.classList.remove('menu-open');
}
}