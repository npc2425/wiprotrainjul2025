import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css']
})
export class RegisterPage implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showSuccess = signal(false);
  usernameChecking = signal(false);
  usernameAvailable = signal<boolean | null>(null);
  
  private destroy$ = new Subject<void>();
  private usernameInput$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userId: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Setup debounced username check
    this.usernameInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(username => {
      this.checkUsername(username);
    });
    
    // Listen for username changes
    this.registerForm.get('userId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value && value.length >= 4) {
        this.usernameChecking.set(true);
        this.usernameAvailable.set(null);
        this.usernameInput$.next(value);
      } else {
        this.usernameAvailable.set(null);
        this.usernameChecking.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkUsername(username: string): void {
    this.authService.checkUsername(username).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.usernameChecking.set(false);
        const isAvailable = !response.exists;
        this.usernameAvailable.set(isAvailable);
        
        if (!isAvailable) {
          this.registerForm.get('userId')?.setErrors({ usernameTaken: true });
        } else {
          // Clear username taken error if it exists
          const errors = this.registerForm.get('userId')?.errors;
          if (errors && errors['usernameTaken']) {
            delete errors['usernameTaken'];
            const hasOtherErrors = Object.keys(errors).length > 0;
            this.registerForm.get('userId')?.setErrors(hasOtherErrors ? errors : null);
          }
        }
      },
      error: () => {
        this.usernameChecking.set(false);
        this.usernameAvailable.set(null);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.usernameAvailable() === true) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const userData = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        userId: this.registerForm.value.userId,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        userType: 1 // Customer by default
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          
          this.successMessage.set('Account created successfully! Redirecting to login...');
          this.showSuccess.set(true);
          
          setTimeout(() => {
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Registration failed. Please try again.');
          
          setTimeout(() => {
            this.errorMessage.set('');
          }, 5000);
          
          console.error('Registration failed:', error);
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['usernameTaken']) {
        return 'This username is already taken';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'firstName': 'First name',
      'lastName': 'Last name',
      'userId': 'Username',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm password'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrengthClass();
    if (!strength) return '';
    const strengthMap: { [key: string]: string } = {
      'weak': 'Weak password',
      'medium': 'Medium strength',
      'strong': 'Strong password'
    };
    return strengthMap[strength];
  }
}
