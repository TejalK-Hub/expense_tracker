import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from '../service/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

 userName: string = 'User';
userInitial: string = 'U';
userRole: string = 'Employee'; // default

constructor(
  private authService: AuthServiceService,
  private router: Router,
  private toastr: ToastrService
) {
  const name = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('userRole') || 'Employee';

  this.userName = name;
  this.userInitial = name.charAt(0).toUpperCase();
  this.userRole = role;
}

  logout() {
    this.authService.logout?.(); // if you have logout method
    localStorage.clear();

    this.toastr.success('Logged out successfully');

    this.router.navigate(['/']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}