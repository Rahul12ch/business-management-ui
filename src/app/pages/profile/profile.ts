import {Component,OnInit,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private readonly apiUrl = environment.serverUrl;
  userId = 0;
  username = '';
  email = '';
  
  originalUsername = '';
  originalEmail = '';
  originalImage = '';
  profileImage = '';
  uploadedImagePath = '';
  createdDate = '';
  currentPassword = '';
  newPassword = '';
  
  showCurrentPwd = false;
  showNewPwd = false;
  loading = false;
  saving = false;
  isEditMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void { this.loadProfile();}

  loadProfile(): void {this.loading = true;
  this.authService.getProfile().subscribe({ next: (user: any) => {
    this.userId = user.id ?? 0; this.username = user.username ?? ''; this.email = user.email ?? '';
    this.createdDate = user.createdDate ? new Date( user.createdDate ).toLocaleDateString(): ''; this.uploadedImagePath = user.profileImage ?? '';
    this.profileImage = this.uploadedImagePath ? `${this.apiUrl}/${this.uploadedImagePath}` : '';

          this.originalUsername = this.username;  this.originalEmail = this.email;  this.originalImage = this.profileImage;  this.loading = false;
          this.cdr.detectChanges(); },
        error: (err) => { this.loading = false; this.cdr.detectChanges(); }});
  }

  enableEdit(): void { this.isEditMode = true;  this.originalUsername = this.username;  this.originalEmail = this.email;  this.originalImage = this.profileImage; }

  onFileSelected(event: any): void { const file =event.target.files?.[0];
    if (!file) {return;} this.authService .uploadImage(file) .subscribe({ next: (res: any) => {
     this.uploadedImagePath = res.imageUrl; this.profileImage = `${this.apiUrl}/${res.imageUrl}`;
      this.cdr.detectChanges();},
        error: () => { this.profileImage = this.originalImage; this.cdr.detectChanges(); }});
  }

  saveProfile(): void {
    if (!this.username.trim()) { return; }
    if (!this.email.trim()) {  return; } const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (  !emailRegex.test( this.email )) { return;}
    if ( this.newPassword && !this.currentPassword ) { return; }

    this.saving = true;
    this.authService .updateProfile({
        username: this.username, email: this.email, currentPassword: this.currentPassword, newPassword: this.newPassword, profileImage: this.uploadedImagePath })
 .subscribe({ next: (response) => {
          this.originalUsername = this.username; this.originalEmail =  this.email;  this.originalImage = this.profileImage;
          this.currentPassword = ''; this.newPassword = ''; this.isEditMode = false;  this.saving = false;  this.showCurrentPwd = false;  this.showNewPwd = false;
          window.dispatchEvent(  new Event('profileUpdated' )); this.cdr.detectChanges();
        },
        error: (err) => { this.saving = false; this.cdr.detectChanges(); }});
  }
  cancelChanges(): void {
    this.username = this.originalUsername; this.email = this.originalEmail; this.profileImage = this.originalImage;
    this.currentPassword = ''; this.newPassword = ''; this.isEditMode = false; this.showCurrentPwd = false; this.showNewPwd = false;
  }
  logout(): void { this.authService .logout(); this.router.navigate([ '/login']); }
}