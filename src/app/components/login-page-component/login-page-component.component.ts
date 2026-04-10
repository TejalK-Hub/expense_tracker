import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../../service/auth-service.service';
import { ToastrService } from 'ngx-toastr';

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
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login(form: NgForm) {
    if (form.invalid) {
      this.toastr.warning('Please fix form errors');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.authService.setVariables(
          response.token,
          response.user.id,
          response.user.role
        );

        this.toastr.success('Login successful');

        if (this.authService.userRole?.toLowerCase() === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: () => {
        this.toastr.error('Invalid email or password');
      },
    });
  }

  register() {
    this.router.navigate(['/signup']);
  }
}