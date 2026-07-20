import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { timeout, TimeoutError } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    CardModule,
    PasswordModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  emailError = '';
  passwordError = '';
  loginError = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login(): void {
    this.emailError = '';
    this.passwordError = '';
    this.loginError = '';

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Enter a valid email address';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!passwordRegex.test(this.password)) {
      this.passwordError = 'Must contain uppercase, lowercase, number and special character';
      isValid = false;
    }

    if (!isValid) return;
    this.loading = true;
    this.authService.login({ email: this.email.trim(), passwordHash: this.password })
    .pipe( timeout(30000)) .subscribe({ next: async (response: any) => {
    if (!response?.token) { this.loading = false;
    this.loginError = 'Unexpected response from the server.';
    return;  }
  this.authService.saveToken(response.token);
  localStorage.setItem('userId', response.userId);
  localStorage.setItem('email', response.email);
  await this.router.navigate(['/dashboard']);
  this.loading = false;
},
      error: (err) => {
  this.loading = false;
  if (err instanceof TimeoutError) {
    this.loginError = 'Server took too long to respond. Please try again.';
  }
  else if (err.status === 401) {
    this.loginError = err.error?.message ?? 'Invalid email or password.';
  }
  else if (err.status === 0) {
    this.loginError = 'Unable to reach the server. Check your connection.';
  }
  else {
    this.loginError = err.error?.message ?? 'Something went wrong.';
  }
}});
  }
}