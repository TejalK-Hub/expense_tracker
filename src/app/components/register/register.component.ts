import { Component } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  
  strength: number = 0;
  strengthText: string = '';
  strengthClass: string = '';

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  checkStrength() {
    let score = 0;

    if (this.password.length >= 6) score++;
    if (/[A-Z]/.test(this.password)) score++;
    if (/[a-z]/.test(this.password)) score++;
    if (/\d/.test(this.password)) score++;
    if (/[^A-Za-z0-9]/.test(this.password)) score++;

    this.strength = score;

    if (score <= 2) {
      this.strengthText = 'Weak';
      this.strengthClass = 'bg-danger';
    } else if (score === 3 || score === 4) {
      this.strengthText = 'Medium';
      this.strengthClass = 'bg-warning';
    } else {
      this.strengthText = 'Strong';
      this.strengthClass = 'bg-success';
    }
  }

  signup(form: NgForm) {
    if (form.invalid) {
      this.toastr.warning('Please fill all required fields correctly');
      return;
    }

    this.authService.signup(this.name, this.email, this.password).subscribe({
      next: () => {
        this.toastr.success('Account created successfully');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.toastr.error('Signup failed');
      }
    });
  }

  goToLogin(){
    this.router.navigate(['/']);
  }
}