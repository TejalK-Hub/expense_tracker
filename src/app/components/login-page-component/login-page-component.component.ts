import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page-component.component.html',
  styleUrl: './login-page-component.component.scss'
})
export class LoginPageComponentComponent {

  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private router: Router) {}

  login() {

    // Admin
    if (this.email === 'admin@mail.com' && this.password === 'admin123') {
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    // User
    if (this.email === 'user@mail.com' && this.password === 'user123') {
      this.router.navigate(['/user-dashboard']);
      return;
    }

    // Error
    this.errorMsg = 'Invalid credentials';
  }

}