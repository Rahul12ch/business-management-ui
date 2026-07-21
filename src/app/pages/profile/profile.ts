import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

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
    private cdr: ChangeDetectorRef,
    private messageService: MessageService ) { }

  ngOnInit(): void { this.loadProfile(); }

  private showToast( severity: 'success' | 'error' | 'warn' | 'info',
    summary: string, detail: string
  ): void {  this.messageService.add({  severity,  summary,  detail });
  }

  loadProfile(): void { this.loading = true; this.authService.getProfile().subscribe({
      next: (user: any) => { this.userId = user.id ?? 0;
        this.username = user.username ?? '';
        this.email = user.email ?? '';
        this.createdDate = user.createdDate  ? new Date(user.createdDate).toLocaleDateString()  : '';
        this.uploadedImagePath = user.profileImage ?? '';
        this.profileImage = this.uploadedImagePath;
        this.originalUsername = this.username;
        this.originalEmail = this.email;
        this.originalImage = this.profileImage;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.loading = false;
        this.showToast(  'error',  'Profile',  err.error?.message || 'Failed to load profile.' );
        this.cdr.detectChanges();
      }});
  }

  enableEdit(): void { this.isEditMode = true;
    this.originalUsername = this.username;
    this.originalEmail = this.email;
    this.originalImage = this.profileImage;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) { return; }
    this.authService.uploadImage(file).subscribe({ next: (res: any) => {
        this.uploadedImagePath = res.imageUrl;
        this.profileImage = res.imageUrl;
        this.showToast( 'success', 'Image Uploaded', res.message || 'Profile image updated.' );
        this.cdr.detectChanges();

      },

      error: (err) => { this.profileImage = this.originalImage;
        this.showToast( 'error', 'Upload Failed', err.error?.message || 'Unable to upload image.' );
        this.cdr.detectChanges();
 }});
  }
  saveProfile(): void {
    if (!this.username.trim()) {
      this.showToast( 'warn', 'Validation', 'Username is required.' );
      return;
    }

    if (!this.email.trim()) {
      this.showToast( 'warn', 'Validation', 'Email is required.' );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showToast( 'warn', 'Validation', 'Please enter a valid email address.' );
      return;
    }

    if (this.newPassword && !this.currentPassword) {
      this.showToast( 'warn', 'Validation', 'Current password is required.' );
      return;
    }
    this.saving = true;
    this.authService.updateProfile({
      username: this.username.trim(), email: this.email.trim(),
      currentPassword: this.currentPassword, newPassword: this.newPassword, profileImage: this.uploadedImagePath
    }).subscribe({ next: (res: any) => {
        this.originalUsername = this.username;
        this.originalEmail = this.email;
        this.originalImage = this.profileImage;

        this.currentPassword = '';
        this.newPassword = '';

        this.showCurrentPwd = false;
        this.showNewPwd = false;

        this.isEditMode = false;
        this.saving = false;

        this.showToast( 'success', 'Success', res.message || 'Profile updated successfully.' );
        window.dispatchEvent(new Event('profileUpdated'));
        this.cdr.detectChanges();
      },
      error: (err) => { this.saving = false;
        this.showToast( 'error', 'Update Failed', err.error?.message || 'Failed to update profile.'
        );
        this.cdr.detectChanges();
      }});
  }

  cancelChanges(): void {
    this.username = this.originalUsername;
    this.email = this.originalEmail;
    this.profileImage = this.originalImage;

    this.currentPassword = '';
    this.newPassword = '';

    this.showCurrentPwd = false;
    this.showNewPwd = false;

    this.isEditMode = false;

    this.showToast( 'info', 'Cancelled', 'Changes have been discarded.' );
  }
}