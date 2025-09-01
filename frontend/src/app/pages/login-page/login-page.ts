import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login successful:', response);
          
          // Show success state briefly before redirect
          this.successMessage.set('Login successful! Redirecting...');
          this.showSuccess.set(true);
          
          // Delay to show success animation
          setTimeout(() => {
            this.isLoading.set(false);
            this.authService.redirectToDashboard();
          }, 1000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Login failed. Please try again.');
          
          // Auto-clear error message after 5 seconds
          setTimeout(() => {
            this.errorMessage.set('');
          }, 5000);
          
          console.error('Login failed:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'userId': 'Username',
      'password': 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }
}
