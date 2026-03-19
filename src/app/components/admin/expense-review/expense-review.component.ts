import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../service/users.service';
import { AuthServiceService } from '../../../service/auth-service.service';
import { BackButtonComponent } from '../../back-button/back-button.component';

@Component({
  selector: 'app-expense-review',
  standalone: true,
  imports: [BackButtonComponent, FormsModule, CommonModule],
  templateUrl: './expense-review.component.html',
  styleUrl: './expense-review.component.scss'
})
export class ExpenseReviewComponent {
  date!: string;
  today: Date = new Date();
  selectedMonth: Date = new Date();
  users: any[] = [];
  maxMonth!: string;

  constructor(
    private router: Router,
    private userService: UsersService,
    private authService: AuthServiceService
  ) {

  }

  ngOnInit() {
    // this.filterByMonth();
    // this.userService.getUsers();
    let temp = new Date();
    this.date = `${String(temp.getMonth() + 1).padStart(2, '0')}-${temp.getFullYear()}`;

    const today = new Date();
    today.setMonth(today.getMonth() - 1);

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    this.maxMonth = `${year}-${month}`;

    this.userService.getUsers().subscribe((res) => {
      console.log("res---->", res)
      console.log("This is the admin token:", this.authService.userToken);
      console.log("DATE:", this.date);
      this.users = res.data;
    });
  }

  dateOnChange(event: any) {
    this.date = (event.target as HTMLInputElement).value;
    console.log("This is the date:", this.date);
  }

  // ngOnint() {
  //   this.userService.getUsers();
  // }


  //-----------------------------------------------------Users Monthly Expenses------------------------------------------------------

  // filteredUsers: any[] = [];
  //   filterByMonth() {
  //     this.filteredUsers = this.getUsersForSelectedMonth();
  //   }

  // getMonthKey(date: Date) {
  //   return date.toLocaleString('default', { month: 'short' });
  // }

  // getUsersForSelectedMonth() {
  //   if (!this.selectedMonth) return [];

  //   const year = this.selectedMonth.getFullYear();
  //   const month = this.getMonthKey(this.selectedMonth);

  //   return this.yearlyUserExpenses?.[year]?.[month] || [];
  // }


  openUserExpenses() {
    this.router.navigate(['/user-expense-review']);
  }
}
