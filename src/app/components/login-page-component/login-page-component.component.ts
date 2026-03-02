import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../../service/auth-service.service';

@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page-component.component.html',
  styleUrl: './login-page-component.component.scss',
})
export class LoginPageComponentComponent {
  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(
    private router: Router,
    private authService: AuthServiceService,
  ) {}

  login() {
    // Admin
    // if (this.email === 'admin@mail.com' && this.password === 'admin123') {
    //   this.authService.setToken('admin-token');
    //   this.router.navigate(['/admin-dashboard']);
    //   return;
    // }

    console.log(`credentials: ${this.email}, ${this.password}`);

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.authService.setVariables(
          response.token,
          response.user.id,
          response.user.role,
        );
        if (this.authService.userRole === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
        console.log(
          `Token received: ${response.token}, User ID: ${response.user.id}, Role: ${response.user.role}`,
        );
      },

      error: (err: any) => {
        console.error('Login Failed:', err);
      },
    });

    // // User
    // if (this.email === 'user@mail.com' && this.password === 'user123') {
    //   this.router.navigate(['/user-dashboard']);
    //   return;
    // }

    // Error
    this.errorMsg = 'Invalid credentials';
  }
}
