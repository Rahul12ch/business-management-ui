import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { timeout, TimeoutError, finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
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
  signupError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register(): void {
    if (this.loading) return;

    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.signupError = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!this.username.trim())
      this.usernameError = 'Username is required';
    else if (this.username.trim().length < 3)
      this.usernameError = 'Username must be at least 3 characters';

    if (!this.email.trim())
      this.emailError = 'Email is required';
    else if (!emailRegex.test(this.email.trim()))
      this.emailError = 'Enter a valid email address';

    if (!this.password)
      this.passwordError = 'Password is required';
    else if (!passwordRegex.test(this.password))
      this.passwordError = 'Must contain uppercase, lowercase, number and special character';

    if (!this.confirmPassword)
      this.confirmPasswordError = 'Confirm Password is required';
    else if (this.password !== this.confirmPassword)
      this.confirmPasswordError = 'Passwords do not match';

    if (this.usernameError || this.emailError || this.passwordError || this.confirmPasswordError) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.register({
      username: this.username.trim(),
      email: this.email.trim(),
      passwordHash: this.password
    })
    .pipe(
      timeout(30000),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        if (err instanceof TimeoutError) {
          this.signupError = 'Server took too long to respond. Please try again.';
        }
        else if (err.status === 409) {
          const message = err.error?.message ?? '';

          if (message === 'Username already exists.')
            this.usernameError = message;
          else if (message === 'An account with this email already exists.')
            this.emailError = message;
          else
            this.signupError = message || 'Registration failed.';
        }
        else if (err.status === 400) {
          this.signupError = err.error?.message ?? 'Invalid registration details.';
        }
        else if (err.status === 0) {
          this.signupError = 'Unable to connect to the server.';
        }
        else {
          this.signupError = err.error?.message ?? 'Registration failed.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}