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

  isDarkTheme = false;

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



  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');

    this.isDarkTheme = savedTheme === 'dark';

    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    }
  }


  // -------------------------------------- THEME TOGGLING --------------------------------------
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;

    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }


  logout() {
    this.authService.logout?.(); // if you have logout method
    localStorage.clear();

    this.toastr.success('Logged out successfully');

    this.router.navigate(['/']);
  }

  goToProfile() {
    this.router.navigate(['/profile-page']);
  }
}