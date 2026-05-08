import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthServiceService } from '../../service/auth-service.service';
import { ToastrService } from 'ngx-toastr';
import { SplashScreenComponent } from '../splash-screen/splash-screen.component';

@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule, CommonModule, SplashScreenComponent],
  templateUrl: './login-page-component.component.html',
  styleUrl: './login-page-component.component.scss',
})
export class LoginPageComponentComponent {
  email: string = '';
  password: string = '';
  errorMsg: string = '';
  showPassword: boolean = false;

  splashScreenVisible: boolean = true;
showLoader: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService
  ) {

    
this.showLoader = true;
 
    setTimeout(() => {
      this.showLoader = false;
    }, 3000);
   }

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
          response.user.name,
          response.user.role
        );
        console.log('Login successful, token stored:', response);

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

  loading: any
}