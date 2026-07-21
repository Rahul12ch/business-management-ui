import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
    InputTextModule,
    ButtonModule
  ],
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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    this.loading = true;

    this.authService.getProfile().subscribe({

      next: (user: any) => {

        this.userId = user.id ?? 0;
        this.username = user.username ?? '';
        this.email = user.email ?? '';

        this.createdDate = user.createdDate
          ? new Date(user.createdDate).toLocaleDateString()
          : '';

        this.uploadedImagePath = user.profileImage ?? '';
        this.profileImage = this.uploadedImagePath;

        this.originalUsername = this.username;
        this.originalEmail = this.email;
        this.originalImage = this.profileImage;

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {

        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Profile',
          detail: err.error?.message || 'Failed to load profile.'
        });

        this.cdr.detectChanges();
      }

    });

  }

  enableEdit(): void {

    this.isEditMode = true;

    this.originalUsername = this.username;
    this.originalEmail = this.email;
    this.originalImage = this.profileImage;

  }

  onFileSelected(event: any): void {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    this.authService.uploadImage(file).subscribe({

      next: (res: any) => {

        this.uploadedImagePath = res.imageUrl;
        this.profileImage = res.imageUrl;

        this.messageService.add({
          severity: 'success',
          summary: 'Image Uploaded',
          detail: res.message || 'Profile image updated.'
        });

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.profileImage = this.originalImage;

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: err.error?.message || 'Unable to upload image.'
        });

        this.cdr.detectChanges();

      }

    });

  }
saveProfile(): void {

  if (!this.username.trim()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Username is required.'
    });
    return;
  }

  if (!this.email.trim()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Email is required.'
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(this.email)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please enter a valid email address.'
    });
    return;
  }

  if (this.newPassword && !this.currentPassword) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Current password is required.'
    });
    return;
  }

  this.saving = true;

  this.authService.updateProfile({
    username: this.username,
    email: this.email,
    currentPassword: this.currentPassword,
    newPassword: this.newPassword,
    profileImage: this.uploadedImagePath
  }).subscribe({

    next: (res: any) => {

      this.originalUsername = this.username;
      this.originalEmail = this.email;
      this.originalImage = this.profileImage;

      this.currentPassword = '';
      this.newPassword = '';

      this.showCurrentPwd = false;
      this.showNewPwd = false;

      this.isEditMode = false;
      this.saving = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: res.message || 'Profile updated successfully.'
      });

      window.dispatchEvent(new Event('profileUpdated'));

      this.cdr.detectChanges();
    },

    error: (err) => {

      this.saving = false;

      this.messageService.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: err.error?.message || 'Failed to update profile.'
      });

      this.cdr.detectChanges();
    }

  });

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
}

logout(): void {

  this.authService.logout();
  this.router.navigate(['/login']);

}
}