import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    CommonModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  usernameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {

    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    if (!this.username.trim()) {
      this.usernameError = 'Username is required';
    }
    else if (this.username.trim().length < 3) {
      this.usernameError = 'Username must be at least 3 characters';
    }
    if (!this.email.trim()) {
      this.emailError = 'Email is required';
    }
    else if (!emailRegex.test(this.email)) {
      this.emailError = 'Enter a valid email address';
    }
    if (!this.password) {
      this.passwordError = 'Password is required';
    }
    else if (!passwordRegex.test(this.password)) {
      this.passwordError = 'Must contain uppercase, lowercase, number and special character';
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirm Password is required';
    }
    else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    }
    if (
      this.usernameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmPasswordError
    ) { return;}

    this.loading = true;
    this.authService.register({
      username: this.username.trim(),
      email: this.email.trim(),
      passwordHash: this.password
    })
    .subscribe({ next: () => { this.router.navigate(['/login']);},
      error: (err) => {
        this.loading = false;
        this.emailError =  err.error || 'Registration Failed'; },
      complete: () => {
        this.loading = false;
      }});
}}