import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthServiceService } from '../service/auth-service.service';


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
  isAdmin: boolean = false;
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
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';
    this.userRole = role;
  }


  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');

    this.isDarkTheme = savedTheme === 'dark';

    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    }

    // if (this.isAdmin) {
    //   this.activeTab = 'admin-dashboard';
    // } else {
    //   this.activeTab = 'user-dashboard';
    // }
    this.setActiveTabFromUrl(this.router.url);
    // this.router.events.subscribe(event => { console.log('Router event:', event) });
    // this.router.events
    // .pipe(filter(event => event instanceof NavigationEnd))
    // .subscribe((event: any) => {
    //   this.setActiveTabFromUrl(event.url)
    // })
  }

  private setActiveTabFromUrl(url: string) {

    if (url.includes('/admin-dashboard')) {
      this.activeTab = 'admin-dashboard';
    }
    else if (url.includes('/user-dashboard')) {

      this.activeTab = 'user-dashboard';
    }
    else if (url.includes('/clients')) {

      this.activeTab = 'clients';
    }
    else if (url.includes('/visits')) {

      this.activeTab = 'visits';
    }
    else if (url.includes('/user-expense-review')) {

      this.activeTab = 'expenses';
    }

  }


  // ---------------------------------------- HEADER NAVIGATION ----------------------------------------
  activeTab = '';

  goToAdminDashboard() {
    this.activeTab = 'admin-dashboard';
    this.router.navigate(['/admin-dashboard']);
  }

  goToUserDashboard() {
    this.activeTab = 'user-dashboard';
    this.router.navigate(['/user-dashboard']);
  }

  viewClients() {
    this.activeTab = 'clients';
    this.router.navigate(['/clients']);
  }

  viewVisits() {
    this.activeTab = 'visits';
    this.router.navigate(['/visits']);
  }

  goToExpenseTable() {
    this.activeTab = 'expenses';

    if (this.authService.isAdmin) {
      this.router.navigate(['/user-expense-review']);
      return;
    } else {
      this.router.navigate(['/review-expense']);
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
    // this.router.navigate(['/profile-page']);
  }
}